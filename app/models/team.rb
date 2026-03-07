class Team < ApplicationRecord
  has_many :users, dependent: :nullify
  has_many :tasks, dependent: :destroy

  validates :name, presence: true, uniqueness: { case_sensitive: false }
end
