class AddTitleToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :title, :string
  end
end
