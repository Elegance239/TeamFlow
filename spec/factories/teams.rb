FactoryBot.define do
  factory :team do
    name { "Test Team #{SecureRandom.hex(4)}" }
    description { "Test description for team" }
  end
end
