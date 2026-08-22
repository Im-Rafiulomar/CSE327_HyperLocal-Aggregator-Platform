/** Facade over AssistantService (intent Chain of Responsibility). */
import { assistantService } from "./assistant/AssistantService.js";

export const answerAssistant = (message, user) => assistantService.answer(message, user);
