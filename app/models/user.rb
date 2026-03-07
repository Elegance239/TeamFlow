class User < ApplicationRecord
  belongs_to :team, optional: true

  enum :role, { team_lead: 0, team_member: 1 }

  validates :name, presence: true
end
