import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContentService } from '../services/content.service';

const contentService = new ContentService();

export class ContentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, platform } = req.query;
      const data = await contentService.getAllContent({
        status: status as string,
        platform: platform as string,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await contentService.getDashboardStats();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await contentService.getContentById(id);
      if (!data) {
        return res.status(404).json({ error: { message: 'Content item not found', code: 'NOT_FOUND' } });
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        contentBody: z.string().optional(),
        themeTag: z.string().optional(),
        platform: z.enum(['LINKEDIN', 'THREADS']),
        targetDate: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);
      const data = await contentService.createContent(validatedData);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const schema = z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        contentBody: z.string().optional(),
        themeTag: z.string().optional(),
        status: z.enum(['IDEA', 'DRAFT', 'READY', 'PUBLISHED']).optional(),
        platform: z.enum(['LINKEDIN', 'THREADS']).optional(),
        publishUrl: z.string().optional(),
        targetDate: z.string().optional().nullable(),
        publishedDate: z.string().optional().nullable(),
        metricsReach: z.number().optional().nullable(),
        metricsLikes: z.number().optional().nullable(),
        metricsComments: z.number().optional().nullable(),
        metricsShares: z.number().optional().nullable(),
      });

      const validatedData = schema.parse(req.body);
      const data = await contentService.updateContent(id, validatedData);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await contentService.softDeleteContent(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async enhanceText(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        text: z.string().min(1),
      });

      const { text } = schema.parse(req.body);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: { message: 'Gemini API key is not configured', code: 'CONFIG_ERROR' } });
      }

      // @ts-ignore
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `Perbaiki teks berikut agar lebih profesional dan menarik, namun JANGAN MENGHILANGKAN gaya bahasa atau pesan utamanya. Perbaiki typo dan tata bahasa jika ada. Jangan menambahkan sapaan awal atau kata penutup yang tidak ada di teks asli, cukup berikan langsung hasil revisinya.\n\nTeks asli:\n${text}`;

      // Coba model dari yang terbaru, fallback ke yang lebih ringan jika 503
      const modelNames = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
      let streamResult: any = null;
      let lastError: any = null;

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          streamResult = await model.generateContentStream(prompt);
          console.log(`Menggunakan model: ${modelName}`);
          break;
        } catch (err: any) {
          lastError = err;
          if (err.status === 503) {
            console.log(`Model ${modelName} sedang penuh (503), mencoba model berikutnya...`);
            continue;
          }
          throw err;
        }
      }

      if (!streamResult) throw lastError;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      console.error('AI Enhancement error:', err);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: err.message || 'Terjadi kesalahan saat memproses AI' })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: { message: err.message || 'Failed to enhance text', code: 'AI_ERROR' } });
      }
    }
  }
}
