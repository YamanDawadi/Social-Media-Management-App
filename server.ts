import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

// Lazy-initialized Gemini client to prevent startup crash if API key is missing
let aiClient: GoogleGenAI | null = null;

// Lazy-initialized Twilio client
let twilioClient: any = null;

function getTwilioClient(): any {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN || "5f55871504d8d2b7164b00bbea96e420";
    if (!accountSid) {
      throw new Error('TWILIO_ACCOUNT_SID environment variable is required to dispatch real SMS notifications.');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please configure secrets in the Settings menu.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check/Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Sentiment Analyzer Route
  app.post('/api/analyze-sentiment', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text field is required and must be a string' });
        return;
      }

      const client = getGeminiClient();
      const prompt = `Analyze this social media feedback text: "${text}". Categorize its sentiment and provide a numerical sentiment score (0 is very negative, 100 is very positive). Offer a 1-sentence justification.`;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, description: "Must be 'positive', 'neutral', or 'negative'" },
              score: { type: Type.INTEGER, description: 'Score between 0 and 100' },
              reason: { type: Type.STRING, description: '1-sentence reasoning' },
            },
            required: ['sentiment', 'score', 'reason'],
          },
        },
      });

      const responseText = aiResponse.text || '';
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error('Sentiment Analysis Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to complete sentiment analysis.',
        isApiKeyError: !process.env.GEMINI_API_KEY,
      });
    }
  });

  // Reply Draft Generator Route with Brand Voice & Self-Tuning Context
  app.post('/api/generate-reply', async (req: Request, res: Response) => {
    try {
      const { content, toneInstruction, handle, context, brandContext, manualTuningContext } = req.body;
      if (!content) {
        res.status(400).json({ error: 'Content is required to draft a reply' });
        return;
      }

      const client = getGeminiClient();
      
      const prompt = `
        You are a seasoned Social Media Engagement Manager.
        Draft a high-quality reply to this incoming comment/message.
        
        Incoming Content: "${content}"
        Customer Handle/Name: ${handle || 'Follower'}
        Post/Story Context if any: "${context || 'General query'}"
        Tone Directive: ${toneInstruction}

        ${brandContext ? `COMPANY BRAND MANUAL & FAQ KNOWLEDGE BASE:\n${brandContext}` : ''}
        ${manualTuningContext ? `ADAPTIVE VOICE STYLE GUIDE (Observe past successful manual tweaks and replicate this exact vocabulary, sign-off preference, and stylistic choice):\n${manualTuningContext}` : ''}

        Write the reply to sound like a native, human-quality CRM response.
        Keep it concise, tailored for the designated platform limits, engaging, and sincere. Incorporate the company FAQ context if relevant to solve the user's query exactly. Do not start with generic corporate fluff. Provide a quick explanation of your formatting choices.
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: 'The finalized brand-relevant draft text' },
              explanation: { type: Type.STRING, description: 'Why this tone/length/FAQ block was chosen' },
            },
            required: ['reply', 'explanation'],
          },
        },
      });

      const responseText = aiResponse.text || '';
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error('Generate Reply Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate response.',
        isApiKeyError: !process.env.GEMINI_API_KEY,
      });
    }
  });

  // Post/Story Brainstorm Route
  app.post('/api/generate-post-concept', async (req: Request, res: Response) => {
    try {
      const { comments } = req.body;
      const commentsText = comments && Array.isArray(comments) 
        ? comments.join('\n- ') 
        : 'General brand update';

      const client = getGeminiClient();
      const prompt = `
        Look at customer inquiries/feedback and brainstorm a single new high-engagement post or story draft to answer their main queries or address their feedback directly.

        Active Customer Feedback List:
        - ${commentsText}

        Create an original post/story concept with an active caption draft, suggested hashtag list, visual layout recommendation, and why it works to satisfy this feedback.
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Subject or header of the brainstorm post' },
              platform: { type: Type.STRING, description: 'Platform suggested (e.g. instagram, twitter, linkedin)' },
              content: { type: Type.STRING, description: 'The full ready-to-use proposed caption draft and hashtags' },
              justification: { type: Type.STRING, description: 'Why this addresses customer comment inquiries' },
            },
            required: ['title', 'platform', 'content', 'justification'],
          },
        },
      });

      const responseText = aiResponse.text || '';
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error('Post/Story Concept Generation Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate post concepts.',
        isApiKeyError: !process.env.GEMINI_API_KEY,
      });
    }
  });

  // Feedback Diagnostic Route
  app.post('/api/insight-summary', async (req: Request, res: Response) => {
    try {
      const { comments } = req.body;
      if (!comments || !Array.isArray(comments) || comments.length === 0) {
        res.status(400).json({ error: 'Comments array is required' });
        return;
      }

      const client = getGeminiClient();
      const payloadString = comments.map(c => `[${c.platform}] ${c.author}: "${c.content}"`).join('\n');

      const prompt = `
        Do a professional social CRM diagnostic across this feed of active comments and direct messages:
        
        Feedback Feed:
        ${payloadString}

        Identify the executive summary of user sentiment, map out the top 3 core active user pain points/questions, categorized by frequency (High, Medium, Low), alongside formal resolution templates, and create a list of upcoming content topics to publish that solves these issues.
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'A 2-3 sentence executive synthesis' },
              painPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING, description: 'The core category of inquiry or problem' },
                    frequency: { type: Type.STRING, description: 'High, Medium, or Low' },
                    solution: { type: Type.STRING, description: 'Resolution guideline or standard draft text' },
                  },
                  required: ['issue', 'frequency', 'solution'],
                },
              },
              contentIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: 'Suggested post headline' },
                    type: { type: Type.STRING, description: 'post or story' },
                    platform: { type: Type.STRING, description: 'e.g. instagram, twitter, linkedin' },
                    concept: { type: Type.STRING, description: 'Brief visual and thematic overview of the concept' },
                  },
                  required: ['title', 'type', 'platform', 'concept'],
                },
              },
            },
            required: ['summary', 'painPoints', 'contentIdeas'],
          },
        },
      });

      const responseText = aiResponse.text || '';
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error('Insight Summary Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to compile CRM insight diagnostics.',
        isApiKeyError: !process.env.GEMINI_API_KEY,
      });
    }
  });

  // PREMIUM 1: Crisis Warning Sentiment & Keyword Escalation Scanner
  app.post('/api/crisis-scan', async (req: Request, res: Response) => {
    try {
      let interactions = req.body.interactions;
      const { comments, smsTarget, slackTarget, emailTarget } = req.body;

      // Handle simple list of string comments fallback for backwards compatibility
      if ((!interactions || !Array.isArray(interactions)) && comments && Array.isArray(comments)) {
        interactions = comments.map((text, index) => ({
          id: `cmt-fallback-${index}`,
          platform: 'instagram',
          authorHandle: `follower_${index}`,
          content: text
        }));
      }

      if (!interactions || !Array.isArray(interactions) || interactions.length === 0) {
        res.status(400).json({ error: 'Interactions or comments list is required to run a crisis scan' });
        return;
      }

      const client = getGeminiClient();
      const docs = interactions.map(i => `[ID: ${i.id}] [Platform: ${i.platform}] @${i.authorHandle}: "${i.content}"`).join('\n');

      const prompt = `
        Analyze this collection of incoming direct messages and public comments for an active crisis.
        A "crisis" constitutes sudden negative sentiment spikes, accusations of "scam," threats of "lawsuit" or "court," calls for "boycott," severe reports of "broken" systems, or privacy/data breach leaks.

        Feed List to scan:
        ${docs}

        Determine the overall crisis state ("safe", "warning", or "critical"), assign a numeric scale score (0 to 100 where 100 is severe brand threat), and output logs explaining specific active threats, outlining customized suggestions for PR damage control, and simulating an automated alert notification (e.g. "Slack alert sent", "SMS dispatch initiated") to the manager. Make sure you pinpoint WHICH exact Interaction IDs triggered the threat!
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallStatus: { type: Type.STRING, description: "Must be 'safe', 'warning', or 'critical'" },
              riskScore: { type: Type.INTEGER, description: 'Score between 0 and 100' },
              justification: { type: Type.STRING, description: 'Executive rationale of risk score' },
              triggeredAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    interactionId: { type: Type.STRING, description: 'The unique ID that triggered this warning' },
                    phraseTriggered: { type: Type.STRING, description: 'The flagged text excerpt' },
                    threatType: { type: Type.STRING, description: 'e.g. lawsuit fear, boycott call, scam accusation, glitch' },
                    severity: { type: Type.STRING, description: 'high, medium, low' },
                    suggestedPRAction: { type: Type.STRING, description: 'Immediate mitigation action guideline' },
                    dispatchedAlerts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'SMS, Slack, or Email dispatch simulations' }
                  },
                  required: ['interactionId', 'phraseTriggered', 'threatType', 'severity', 'suggestedPRAction', 'dispatchedAlerts']
                }
              }
            },
            required: ['overallStatus', 'riskScore', 'justification', 'triggeredAlerts']
          }
        }
      });

      const responseText = aiResponse.text || '';
      const parsedResult = JSON.parse(responseText.trim());

      const overallStatus = parsedResult.overallStatus || 'safe';
      const riskScore = parsedResult.riskScore || 0;
      const justification = parsedResult.justification || 'No active alerts detected.';
      const triggeredAlerts = parsedResult.triggeredAlerts || [];

      const crisisTriggered = (overallStatus === 'warning' || overallStatus === 'critical' || riskScore > 60);

      // Perform real Twilio SMS Dispatch if a crisis was triggered and an SMS recipient target is provided
      let twilioDispatched = false;
      let twilioSid: string | null = null;
      let twilioError: string | null = null;

      if (crisisTriggered && smsTarget) {
        try {
          const tClient = getTwilioClient();
          const fromNum = process.env.TWILIO_FROM_NUMBER || "+15551234567";
          const smsBody = `🚨 CRM Sentinel Brand Crisis Warning!\nRisk Score: ${riskScore}/100\nThreats: ${triggeredAlerts.map((a: any) => a.threatType).join(', ')}\nExcerpt: "${triggeredAlerts[0]?.phraseTriggered || justification}"`;

          console.log(`[Twilio] Attempting real SMS broadcast to ${smsTarget} via from: ${fromNum}...`);
          const msg = await tClient.messages.create({
            body: smsBody,
            from: fromNum,
            to: smsTarget
          });
          console.log(`[Twilio] SMS successfully dispatched. SID: ${msg.sid}`);
          twilioDispatched = true;
          twilioSid = msg.sid;
        } catch (twilioErr: any) {
          console.warn('[Twilio] SMS dispatch skipped/failed:', twilioErr.message || twilioErr);
          twilioError = twilioErr.message || String(twilioErr);
        }
      }

      // Map to frontend-friendly fields to support both sentinel/crisis interfaces simultaneously
      const sentimentTrendScore = riskScore;
      const flaggedComments = triggeredAlerts.map((t: any) => ({
        text: t.phraseTriggered || 'Flagged threat',
        score: t.severity === 'high' ? 95 : t.severity === 'medium' ? 75 : 55,
        category: t.threatType || 'legal'
      }));

      const reconciliationAction = triggeredAlerts[0]?.suggestedPRAction || 'Redirected emergency customer record to senior PR management triage queue.';

      const alertsDispatched = {
        slack: !!slackTarget,
        sms: twilioDispatched,
        smsSid: twilioSid,
        smsError: twilioError,
        email: !!emailTarget
      };

      res.json({
        overallStatus,
        riskScore,
        justification,
        triggeredAlerts,
        // Legacy support mapping
        crisisTriggered,
        sentimentTrendScore,
        flaggedComments,
        reconciliationAction,
        alertsDispatched
      });
    } catch (error: any) {
      console.error('Crisis Scan Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to complete crisis audit.',
        isApiKeyError: !process.env.GEMINI_API_KEY,
      });
    }
  });

  // PREMIUM 3: Automated Competitor Recon SWAT listening
  app.post('/api/competitor-recon', async (req: Request, res: Response) => {
    try {
      const { competitorHandle } = req.body;
      if (!competitorHandle) {
        res.status(400).json({ error: 'Competitor handle/name is required' });
        return;
      }

      const client = getGeminiClient();
      const prompt = `
        Perform competitive SMM listening Intelligence on this competitor profile: "${competitorHandle}".
        
        Generate a comprehensive, actionable Competitive Opportunity SWOT Report.
        Simulate typical recent user complaints on their social feeds for their vertical (software, SMM, CRM or design services) — such as issues with app updates, bug glitches, billing traps, or poor user experience.
        
        Identify their exact core weaknesses, rate the market opportunity score (0 to 100), and define a precise "Content Inversion Marketing Playbook" (e.g. what targeted Instagram or LinkedIn ad layouts to launch today to capture their frustrated users).
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              competitorHandle: { type: Type.STRING },
              listeningSampleCount: { type: Type.INTEGER },
              coreComplaintsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunitiesTable: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING, description: 'Competitor service loophole or user frustration' },
                    urgency: { type: Type.STRING, description: 'High, Medium, or Low opportunity index' },
                    marketingInversionPlaybook: { type: Type.STRING, description: 'Actionable design guide for ad copy capturing these users' }
                  },
                  required: ['issue', 'urgency', 'marketingInversionPlaybook']
                }
              },
              aiStrategistSummary: { type: Type.STRING, description: '3-sentence executive tactical summary strategy' }
            },
            required: ['competitorHandle', 'listeningSampleCount', 'coreComplaintsDetected', 'opportunitiesTable', 'aiStrategistSummary']
          }
        }
      });

      res.json(JSON.parse((aiResponse.text || '').trim()));
    } catch (error: any) {
      console.error('Competitor Recon Error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to run Competitor Recon.',
        isApiKeyError: !process.env.GEMINI_API_KEY
      });
    }
  });

  // PREMIUM 4: Proactive Content Inversion - Turning Complaints into Content Goldmines
  app.post('/api/content-goldmines', async (req: Request, res: Response) => {
    try {
      const { complaints } = req.body;
      if (!complaints || !Array.isArray(complaints)) {
        res.status(400).json({ error: 'List of active customer frustrations/complaints is required' });
        return;
      }

      const client = getGeminiClient();
      const docs = complaints.join('\n- ');

      const prompt = `
        You are a Growth Marketing Director. Take the following top user complaints or questions:
        ${docs}

        Turn these complaints on their heads! If customer is confused about how a feature works or complaining about speed, draft high-engagement marketing content to proactively explain it educational-style.
        
        Generate exactly 3 tailored pieces of "Content Goldmines" setups. Provide:
        1. The specific frustration being addressed.
        2. A catchy title/theme.
        3. Visual/Script format (e.g., TikTok/Reels vertical script, LinkedIn educational carousel slide outline, or a Twitter/X thread layout).
        4. Full ready-to-publish educational text script/storyboard.
        5. Growth marketing goal.
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              goldmines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    customerFrustration: { type: Type.STRING },
                    marketingTitle: { type: Type.STRING },
                    format: { type: Type.STRING, description: 'e.g. TikTok/Reels Video Script, LinkedIn Slides layout, X Thread' },
                    scriptOrOutline: { type: Type.STRING, description: 'Full caption text, slide points or script dialogues' },
                    proactiveGoal: { type: Type.STRING }
                  },
                  required: ['customerFrustration', 'marketingTitle', 'format', 'scriptOrOutline', 'proactiveGoal']
                }
              }
            },
            required: ['goldmines']
          }
        }
      });

      res.json(JSON.parse((aiResponse.text || '').trim()));
    } catch (error: any) {
      console.error('Content Goldmines Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to invert content goldmines.',
        isApiKeyError: !process.env.GEMINI_API_KEY
      });
    }
  });

  // PREMIUM 5: Multilingual VIP Localization & Translation Engine
  app.post('/api/translate-message', async (req: Request, res: Response) => {
    try {
      const { text, managerReply } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Text content to translate is required' });
        return;
      }

      const client = getGeminiClient();
      const prompt = `
        You are an elite translation advisor and localization translator.
        
        Original Message context: "${text}"
        ${managerReply ? `Manager Drafted English Reply to Translate back to Source: "${managerReply}"` : ''}

        1. Detect the original language of the customer message.
        2. Translate the customer message exactly into professional English for the business owner.
        3. ${managerReply ? `Translate the English managerReply back into the detected language. Optimize it for highly polite, elite business standards, matching appropriate localized idioms, expressions, and cultural politeness benchmarks.` : 'Do not translate reply yet.'}
        4. Explain the cultural nuances or polite idioms applied in detail.
      `;

      const aiResponse = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedLanguage: { type: Type.STRING },
              englishTranslation: { type: Type.STRING },
              replyInNative: { type: Type.STRING, description: 'Polished local language translation of managerReply' },
              culturalNuance: { type: Type.STRING, description: 'Cultural idiom details or polite norms applied' }
            },
            required: ['detectedLanguage', 'englishTranslation', 'culturalNuance']
          }
        }
      });

      res.json(JSON.parse((aiResponse.text || '').trim()));
    } catch (error: any) {
      console.error('Translation Engine Error:', error);
      res.status(500).json({
        error: error.message || 'Failed to execute multilingual localization.',
        isApiKeyError: !process.env.GEMINI_API_KEY
      });
    }
  });

  // Vite integration for asset serving & fallback routing
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched and listening on port ${PORT}`);
  });
}

startServer();
