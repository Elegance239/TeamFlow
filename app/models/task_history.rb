class TaskHistory < ApplicationRecord
  belongs_to :user
  belongs_to :task

  validates :start_date, presence: true
end
