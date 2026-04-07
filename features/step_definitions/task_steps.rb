# features/step_definitions/task_steps.rb

When('I click on the task with description {string}') do |description|
  find('div, p, span, h6', text: description, wait: 15, visible: true, match: :prefer_exact).click
  sleep 1
end

Given('a task exists with description {string} and state {string} assigned to me') do |desc, state|
  team = @user.team || Team.first || Team.create!(name: "Default Team")

  Task.create!(
    description: desc,
    current_state: state,
    user_id: @user.id.to_i,
    created_by: @user.id,
    team: team,
    points: 1,
    due_date: Date.today + 1.day,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED"
  )
end

Then('the task {string} should be in the {string} section') do |desc, section_name|
  expect(page).to have_css('.MuiBox-root', text: section_name)
  within('.MuiBox-root', text: section_name, match: :prefer_exact) do
    expect(page).to have_content(desc)
  end
end
