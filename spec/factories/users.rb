FactoryBot.define do
  factory :user do
    name { "Test User" }
    email { "user-#{SecureRandom.hex(4)}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    role { :team_member }

    trait :team_lead do
      role { :team_lead }
    end

    trait :guest do
      role { nil }
    end
  end
end
