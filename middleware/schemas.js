import {z} from 'zod'

export const postSchema = z.object({
  authorId: z.string().min(1, "User ID is required"),
  content: z.string().optional(),
  media: z.object({
    url: z.string().min(1, "File data is empty"),
    fileType: z.enum(["image", "pdf"], { 
      errorMap: () => ({ message: "Only Images and PDFs are allowed" }) 
    }),
    name: z.string(),
  }).optional()
  // Custom validation: Either Content OR Media must exist
}).refine((data) => data.content || data.media, {
  message: "Post cannot be empty. Add text or a file.",
  path: ["content"],
});