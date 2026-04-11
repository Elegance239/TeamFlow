# features/step_definitions/task_steps.rb

When(/^I click on the task with title "([^"]*)"$/) do |title|
  js_selector = <<~JS
    (function() {
      const target = '#{title}'.trim().toUpperCase();
      const cards = Array.from(document.querySelectorAll('.task-card'));
      const found = cards.find(c => {
        const t = c.querySelector('.MuiTypography-h6') || c;
        return t.innerText.trim().toUpperCase() === target || c.innerText.trim().toUpperCase().includes(target);
      });
      if (found) {
        found.scrollIntoView({ block: 'center' });
        found.click();
        return true;
      }
      return false;
    })()
  JS
  
  success = page.execute_script(js_selector)
  unless success
    find('.task-card', text: title, wait: 5).click
  end
  find('[role="dialog"]', wait: 5)
end

Given(/^a task exists with title "([^"]*)" and state "([^"]*)"( assigned to me)?$/) do |title, state, assigned|
  step "a task exists with title \"#{title}\" and state \"#{state}\" and requirements#{assigned}"
end

Given(/^a task exists with title "([^"]*)" and state "([^"]*)" and requirements( assigned to me)?$/) do |title, state, assigned|
  needs_validation = page.source.include?("needs validation")
  
  team = @user&.team || Team.find_or_create_by!(name: "Dev Team")
  creator = User.find_by(role: :team_lead) || User.create!(
    email: "system_lead@example.com",
    name: "System Lead",
    password: "password123",
    role: :team_lead,
    team: team
  )
  
  user_id = assigned ? @user.id : nil
  
  Task.create!(
    title: title,
    description: "Auto-generated test task",
    current_state: state,
    team: team,
    user_id: user_id,
    creator: creator,
    points: 3,
    due_date: Date.today + 7.days,
    needs_validation: needs_validation,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED"
  )
end

Given(/^a task exists with title "([^"]*)" and state "([^"]*)" and skills "([^"]*)"$/) do |title, state, skills|
  team = @user&.team || Team.find_or_create_by!(name: "Dev Team")
  creator = User.find_by(role: :team_lead) || User.create!(email: "system_lead@example.com", name: "System Lead", password: "password123", role: :team_lead, team: team)
  
  Task.create!(
    title: title,
    description: "Skill test task",
    current_state: state,
    team: team,
    creator: creator,
    points: 5,
    due_date: Date.today + 10.days,
    required_skills: skills,
    all_states: "UNASSIGNED,ASSIGNED,COMPLETED"
  )
end

Then('the task {string} should be in the {string} section') do |title, section_name|
  within('.MuiBox-root', text: section_name, match: :prefer_exact) do
    expect(page).to have_content(title)
  end
end

When('I select {string} from the {string} dropdown') do |value, label|
  find('label', text: label).click
  find('li', text: value, wait: 5).click
end

Then('I should see {string} as the assigned user') do |user_name|
  within('[role="dialog"]') do
    expect(page).to have_content(user_name)
  end
end

When('I approve the pending transition for {string}') do |task_title|
  within('.MuiCard-root', text: task_title) do
    click_button "Approve"
  end
end
