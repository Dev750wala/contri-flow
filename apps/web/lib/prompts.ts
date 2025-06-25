export const PROMPT_FOR_JSON_IN_MULTILINE_LINE_FORMAT = `
You are an assistant that analyzes GitHub comment messages written by repository maintainers.

Your job is to extract structured data from natural language comments that mention contributor rewards.

Return the output in JSON format like this:
{
  "contributor": "<GitHub username of the person being rewarded>",
  "reward": <numerical amount of reward>
}

Rules:
- The contributor must be clearly named in the comment.
- The reward amount should be a number, typically representing points, tokens, or dollars.
- give only json format, so that it can be easily parsed
- If the comment doesn’t contain enough information, return:
{
  "contributor": null,
  "reward": null
}

Here are some example inputs and the expected output format.

---

**Example 1 (Input):**
"Great work @dev123 on fixing the gas optimization in the smart contract! You’ve earned 50 tokens."

**Output:**
{
  "contributor": "dev123",
  "reward": 50
}

---

**Example 2 (Input):**
"Shoutout to @alex99 and @kat-dev! Alex gets 100 points for bug fix, and Kat gets 75 for docs."

**Output:**
[
  {
    "contributor": "alex99",
    "reward": 100
  },
  {
    "contributor": "kat-dev",
    "reward": 75
  }
]

---

**Example 3 (Input):**
"Thanks everyone! We’ll do rewards later."

**Output:**
{
  "contributor": null,
  "reward": null
}

---

Now parse the following comment:
"[COMMENT]"
`

export const PROMPT_FOR_JSON_IN_SINGLE_LINE_FORMAT = `
You are an assistant that analyzes GitHub comment messages from repository maintainers.

Your task is to extract contributor rewards based on the message.

Return the result as a **single-line JSON string**, without any markdown, explanation, or line breaks.

Format:
{"contributor": "<username>", "reward": <amount>}

If multiple contributors are rewarded, return an array of objects in one line like:
[{"contributor": "user1", "reward": 100}, {"contributor": "user2", "reward": 75}]

If no reward is mentioned, return:
{"contributor": null, "reward": null}

Now analyze this comment:
"[COMMENT]"
`