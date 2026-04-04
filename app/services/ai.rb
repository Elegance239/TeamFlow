require 'net/http'
require 'uri'
require 'json'

class Ai
    def self.generate_task(prompt)
        MODEL="gemini-1.5-flash"
        api_key=ENV['API_KEY']
        API_URL="https://generativelanguage.googleapis.com/v1beta/models/#{MODEL}:generateContent?key=#{api_key}"

        
        if api_key.nil? || api_key.empty?
            return{error: "Missing API key"}
          end
        
        SYSTEM_PROMPT="You are an expert project manager.

Your job:
- Break down a user request into actionable tasks
- Ensure tasks are realistic and prioritized
- Return ONLY valid JSON

Rules:
- Each task must include:
  - title (short)
  - description (clear)
  - points (1-100)
  - due_days_from_now 

Avoid vague tasks."

        uri=URI(API_URL)
        payload={
            contents: [{parts: [{text: "#{SYSTEM_PROMPT} for: #{prompt}"
            generationConfig: {responseMimeType:"application/json"}]
        }.to_json

        begin 
            response=Net::HTTP.post(uri, payload,
            {"Content-Type"=>"application/json"})

            if rsponse.is_a?(Net::HTTPSuccess)
                raw_data=JSON.parse(response.body)
                ai_text=raw_data.dig("candidates",0,"content","parts",0,"text")
                JSON.parse(ai_text)
            else
                {error:"API Request Failed"}
            end
        rescue=>each
            {error:"system error: #{e.message}"}
        end
    end
end
