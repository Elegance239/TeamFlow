class CreateTaskHistories < ActiveRecord::Migration[8.1]
  def change
    create_table :task_histories do |t|
      t.bigint :user_id, null: false
      t.bigint :task_id, null: false
      t.date   :start_date, null: false
    end

    add_foreign_key :task_histories, :users
    add_foreign_key :task_histories, :tasks

    add_index :task_histories, [:user_id, :task_id]
  end
end
