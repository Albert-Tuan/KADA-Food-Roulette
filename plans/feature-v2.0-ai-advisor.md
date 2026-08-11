# Feature Plan: AI Food Advisor

## Overview
AI-powered food advisor dựa trên full menu và context, gợi ý món ăn thông minh.

## User Stories
- US-150: AI Food Advisor từ vỏ menu ăn

## Architecture Decisions
- **LLM:** GPT-4o hoặc Claude Sonnet cho reasoning
- **Prompt:** Context-aware prompts với user preferences
- **Caching:** Cache responses để reduce API calls

---

## Task List

### Phase 1: Backend AI Service

#### Task 1: Food Advisor Service
**Description:** Service để generate food recommendations

**Acceptance criteria:**
- [ ] `getRecommendation(menuItems, userPrefs, context)` function
- [ ] Build prompt with menu + preferences
- [ ] Call LLM API
- [ ] Parse and return recommendations
- [ ] Handle API errors

**Verification:**
- [ ] Recommendations relevant
- [ ] Response time acceptable (< 5s)

**Dependencies:** None

**Files likely touched:**
- `backend/src/shared/foodAdvisor.service.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 2: Advisor API
**Description:** API endpoint cho food advisor

**Acceptance criteria:**
- [ ] `POST /api/menu/:id/advise` get recommendations
- [ ] Accept menu items + context
- [ ] Return recommended items + explanations
- [ ] Rate limiting

**Verification:**
- [ ] API works correctly
- [ ] Responses cached

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/menu/menu.controller.ts`
- `backend/src/modules/menu/menu.service.ts`

**Estimated scope:** Small (2 files)

---

#### Task 3: Conversation Memory
**Description:** Lưu conversation history cho context

**Acceptance criteria:**
- [ ] Store advisor conversations
- [ ] Use history for follow-up questions
- [ ] Clear history option
- [ ] Context window management

**Verification:**
- [ ] History used in conversation
- [ ] Memory doesn't overflow

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/shared/foodAdvisor.service.ts`

**Estimated scope:** Small (1-2 files)

---

### Checkpoint: After Tasks 1-3
- [ ] AI service works
- [ ] Recommendations relevant
- [ ] History preserved

---

### Phase 2: Mobile UI

#### Task 4: Advisor Chat Screen
**Description:** Screen để chat với AI advisor

**Acceptance criteria:**
- [ ] Chat interface
- [ ] Show menu context
- [ ] AI responses with food suggestions
- [ ] Tap suggestion to add to spin

**Verification:**
- [ ] Chat works smoothly
- [ ] Suggestions accurate

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/menu/[id]/advisor.tsx`
- `apps/mobile/src/components/AdvisorChat.tsx`

**Estimated scope:** Medium (3 files)

---

#### Task 5: Advisor Quick Actions
**Description:** Quick action buttons

**Acceptance criteria:**
- [ ] "I'm craving..." button
- [ ] "What's popular?" button
- [ ] "Suggest for my taste" button
- [ ] "Dietary needs" button

**Verification:**
- [ ] Buttons trigger correct prompts
- [ ] Responses relevant to intent

**Dependencies:** Task 4

**Files likely touched:**
- `apps/mobile/src/components/AdvisorQuickActions.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 4-5
- [ ] Chat interface complete
- [ ] Quick actions work
- [ ] Suggestions relevant

---

### Phase 3: Web UI

#### Task 6: Web Advisor Panel
**Description:** Advisor panel cho web

**Acceptance criteria:**
- [ ] Chat panel sidebar
- [ ] Menu context display
- [ ] AI responses
- [ ] Add to spin button

**Verification:**
- [ ] Chat works on web
- [ ] Responsive layout

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/components/menu/AdvisorPanel.tsx`

**Estimated scope:** Medium (3 files)

---

### Checkpoint: Complete
- [ ] Backend complete
- [ ] Mobile UI complete
- [ ] Web UI complete
- [ ] AI recommendations accurate

---

## Total Effort
- Backend AI Service: 8h
- Backend API: 2h
- Mobile UI: 6h
- Web UI: 4h
- **Total: ~20h**

---

## Advisor Prompt Template

```markdown
# Food Advisor Prompt

## Context
User is at [Restaurant Name] looking at menu.
User's taste profile: [taste preferences]
Current context: [time of day, group size, occasion]

## Menu
[MENU_ITEMS_JSON]

## Task
Based on the user's preferences and context:
1. Suggest top 3 dishes that match their taste
2. Explain why each dish is recommended
3. Consider dietary restrictions if any

## Response Format
{{
  "recommendations": [
    {{
      "item": "Dish Name",
      "reason": "Why recommended",
      "matchScore": 0.95,
      "tags": ["cay", "hải sản"]
    }}
  ],
  "reasoning": "Overall explanation"
}}
```

---

## Open Questions
- Có cần voice input cho advisor không?
- Limit requests per user?
- Free tier có access không?
