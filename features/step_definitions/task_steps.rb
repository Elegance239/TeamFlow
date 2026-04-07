# features/step_definitions/task_steps.rb

When('I click on the task with description {string}') do |description|
  
  find('span, p, h6, div', text: description, match: :prefer_exact).click
end

Given('a task exists with description {string} and state {string} assigned to me') do |desc, state|
  Task.create!(
    description: desc,
    current_state: state,
    user_id: @user.id,
    created_by: @user.id,
    points: 1,
    due_date: Date.today + 1.day,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED"
  )
end

Then('the task {string} should be in the {string} section') do |desc, section_name|
  within('.MuiBox-root', text: section_name) do
    expect(page).to have_content(desc)
  end
end
