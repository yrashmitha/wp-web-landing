import raw from "./course-content.json";
import { courseContentSchema, type CourseContent } from "./course-content.schema";

/** Validates course-content.json once and fails the build with a readable list of problems. */
export function loadCourseContent(): CourseContent {
  const parsed = courseContentSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n");
    throw new Error(`course-content.json is invalid:\n${problems}`);
  }
  return parsed.data;
}
