class CreateTaskSteps < ActiveRecord::Migration[8.1]
  def change
    create_table :task_steps, primary_key: [ :task_id, :step_num ] do |t|
      t.date    :due_date                   # optional
      t.string  :name,        null: false
      t.text    :description               # optional
      t.integer :step_num,    null: false
      t.bigint  :task_id,     null: false

      t.datetime :created_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
    end

    add_foreign_key :task_steps, :tasks
    add_index :task_steps, :task_id
  end
end
