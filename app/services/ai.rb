require "net/http"
require "uri"
require "json"

MODEL="gemini-2.5-flash"
SYSTEM_PROMPT=<<~PROMPT
    You are an expert project manager. Your job:
        - Break down the following request into a single actionable task.
        - Ensure the task is realistic and prioritized.
        - Return ONLY a single valid JSON object.
        
        Request: "{{PROMPT}}"

        Rules:
        - The JSON must include:
          - "title": (short string)
          - "description": (detailed string)
          - "points": (integer 1-100)
          - "due_days_from_now": (integer)
          - "required_skills": (comma-separated string of technical skills)
        - Avoid vague tasks.
PROMPT

class Ai
    def self.generate_task(prompt)
        api_key = ENV["GEMINI_API_KEY"]

        if api_key.nil? || api_key.empty?
            return { error: "Missing API Key" }
        end

        api_url = "https://generativelanguage.googleapis.com/v1/models/#{MODEL}:generateContent"

        uri = URI(api_url)
        uri.query = URI.encode_www_form({ key: api_key })

        payload = {
            contents: [ { parts: [ { text: SYSTEM_PROMPT.gsub("{{PROMPT}}", prompt) } ] } ]
        }.to_json

        begin
            response = Net::HTTP.post(uri, payload,
            { "Content-Type" => "application/json" })

            if response.is_a?(Net::HTTPSuccess)
                raw_data = JSON.parse(response.body)
                ai_text = raw_data.dig("candidates", 0, "content", "parts", 0, "text")

                clean_json = ai_text.to_s.gsub(/```json|```/, "").strip

                begin
                    JSON.parse(clean_json)
                rescue
                    { error: "AI returned invalid JSON", raw: ai_text }
                end
            else
                error_data = JSON.parse(response.body) rescue {}
                google_message = error_data.dig("error", "message")
                google_status = error_data.dig("error", "status")

                if response.code == "429" || google_status == "RESOURCE_EXHAUSTED"
                    { error: "Rate limit reached. Please wait and try again." }
                elsif response.code == "400" && (google_message&.include?("API key") || google_status == "API_KEY_INVALID")
                    { error: "Invalid Gemini API Key. Please check your configuration." }
                else
                    { error: google_message || "API Request Failed (Status: #{response.code})" }
                end
            end
        rescue => e
            { error: "system error: #{e.message}" }
        end
    end
end
