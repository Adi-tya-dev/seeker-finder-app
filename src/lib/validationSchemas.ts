import { z } from 'zod';

export const itemSchema = z.object({
  building: z.string().trim().min(1, "Building is required").max(100, "Building name too long"),
  classroom: z.string().trim().min(1, "Classroom is required").max(50, "Classroom name too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  category: z.enum(['electronics', 'accessories', 'documents', 'clothing', 'books', 'keys', 'wallet', 'other'], {
    errorMap: () => ({ message: "Please select a valid category" })
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format")
});

export const messageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message too long (max 1000 characters)")
});

export type ItemFormData = z.infer<typeof itemSchema>;
export type MessageData = z.infer<typeof messageSchema>;
