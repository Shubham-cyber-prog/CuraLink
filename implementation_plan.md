# Add Gemini AI Integration to Summarize Record API

## Goal
Integrate Google Gemini AI as the primary summarizer for the `summarize-record` endpoint, with a fallback to Anthropic if the Gemini API key is not configured. This includes:
- Adding a `GEMINI_API_KEY` placeholder to `.env` (already added).
- Installing the `@google/generative-ai` npm package.
- Updating the route to dynamically import and use Gemini when available.
- Maintaining existing functionality and response format.
- Ensuring TypeScript types are correct and no runtime errors occur.

## User Review Required
> [!IMPORTANT]
> Please confirm that you want Gemini to be the primary model and that you have (or will obtain) a valid Gemini API key. If you prefer to keep Anthropic as primary, let us know.

## Open Questions
> [!QUESTION]
> Do you want any additional custom system prompt modifications for Gemini, or can we reuse the existing Anthropic prompt verbatim?

## Proposed Changes
---
### .env
- Already added placeholder `GEMINI_API_KEY=`.

### package.json
- Add dependency `@google/generative-ai`.

### app/api/ai/summarize-record/route.ts
- Import `GoogleGenerativeAI` dynamically.
- Add conditional logic:
  ```ts
  const useGemini = Boolean(process.env.GEMINI_API_KEY);
  if (useGemini) {
    // Gemini implementation
  } else {
    // Existing Anthropic implementation
  }
  ```
- For Gemini, construct a similar system prompt and generate content using `model.generateContent`.
- Return a plain text response (or stream) matching the existing API contract.

---
## Verification Plan
- Run `npm install @google/generative-ai`.
- Execute `npm run dev` and POST a sample payload to `/api/ai/summarize-record`.
- Verify response structure and content.
- Ensure fallback works when `GEMINI_API_KEY` is empty.

### Automated Tests
- (If any) Add a unit test mocking both Gemini and Anthropic branches.

### Manual Verification
- Use curl or Postman to send a request with sample medical report content.
- Check that the response includes the required sections.

