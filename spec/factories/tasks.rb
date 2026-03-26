FactoryBot.define do
  factory :task do
    due_date { Date.today + 5 }
    points { 3 }
    description { "Test task description" }

    team
    created_by { association(:user, :team_lead, team: team) }

    trait :unassigned do
      user_id { nil }
    end
  end
end
