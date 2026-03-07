class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.text    :description
      t.date    :due_date,   null: false
      t.bigint  :user_id                        # assigned user (nullable)
      t.bigint  :team_id,    null: false
      t.bigint  :created_by, null: false
      t.integer :points,     null: false

      t.timestamps
    end

    add_check_constraint :tasks, "points > 0", name: "check_tasks_points_positive"

    add_foreign_key :tasks, :users, column: :user_id
    add_foreign_key :tasks, :teams, column: :team_id
    add_foreign_key :tasks, :users, column: :created_by

    add_index :tasks, :team_id
    add_index :tasks, :user_id
    add_index :tasks, :created_by
  end
end
