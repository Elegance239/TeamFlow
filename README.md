# CSCI3100 - Group 25

## Documentation

### Routes

#### Authentication (Via Devise)
| Method | Path | Params | Behaviour | Success JSON (example) | Error JSON (example) |
|--------|------|--------|-----------|-------------------------|----------------------|
| `POST` | `/users/sign_in` | `email`, `password` | Log in existing user | `{ "message": "Logged in successfully", "user": { "id": 1, "name": "Riley", "email": "riley@team.dev", "role": "team_member" } }` | `{ "error": "Invalid email or password" }` |
| `DELETE` | `/users/sign_out` | — | Log out current user | `{ "message": "Logged out successfully" }` | Devise auth error |
| `POST` | `/users` | `user[name]`, `user[email]`, `user[password]`, `user[password_confirmation]`, `user[role]?` | Create account | `{ "message": "Account created successfully", "user": { "id": 1, "name": "Riley", "email": "riley@team.dev", "role": "team_member" } }` | `{ "errors": ["Email has already been taken"] }` |
| `PATCH` / `PUT` | `/users` | Devise account fields | Update current account | Devise default JSON/response for update | Devise validation errors |
| `DELETE` | `/users` | — | Delete current account | `{ "message": "Account deleted successfully" }` | `{ "errors": ["..."] }` |
| `POST` | `/users/password` | `user[email]` | Send password reset email | `{ "message": "Password reset email sent" }` | `{ "error": "Email not found" }` |
| `PATCH` / `PUT` | `/users/password` | `user[reset_password_token]`, `user[password]`, `user[password_confirmation]` | Reset password | Devise default JSON/response for reset | Devise validation errors |
| `GET` | `/users/sign_in` | — | Devise sign-in page route | HTML page (not JSON API) | — |
| `GET` | `/users/sign_up` | — | Devise sign-up page route | HTML page (not JSON API) | — |
| `GET` | `/users/password/new` | — | Devise forgot-password page route | HTML page (not JSON API) | — |
| `GET` | `/users/password/edit` | — | Devise reset-password page route | HTML page (not JSON API) | — |
| `GET` | `/users/cancel` | — | Devise registration cancel route | HTML response | — |
| `GET` | `/users/edit` | — | Devise account edit page route | HTML page (not JSON API) | — |

#### Users
| Method | Path | Params | Behaviour | Success JSON (example) | Error JSON (example) |
|--------|------|--------|-----------|-------------------------|----------------------|
| `GET` | `/users/:id` | — | Return own user info including team and overall score | `{ "id": 2, "name": "Riley", "email": "member@teamflow.dev", "team_id": 1, "team": { "id": 1, "name": "Platform" }, "overall_score": 13 }` | `{ "error": "Unauthorized" }` |
| `PATCH` / `PUT` | `/users/:id` | `name` | Update own name | User JSON object | `{ "error": "Unauthorized" }` or `{ "errors": ["Name can't be blank"] }` |

#### Teams
| Method | Path | Params | Behaviour | Success JSON (example) | Error JSON (example) |
|--------|------|--------|-----------|-------------------------|----------------------|
| `POST` | `/teams` | `name`, `description?` | Create team and set requester as team lead | `{ "team": { "id": 1, "name": "Platform", "description": "Core team" }, "user": { "id": 1, "role": "team_lead", "team_id": 1 } }` | `{ "errors": ["Name has already been taken"] }` |
| `GET` | `/teams/:id` | — | Return team info + team leads (member only) | `{ "id": 1, "name": "Platform", "description": "Core team", "team_leads": [{ "id": 1, "name": "Taylor" }] }` | `{ "error": "You are not a member of this team" }` |
| `PATCH` / `PUT` | `/teams/:id` | `description` | Update team description (team lead only) | Team JSON object | `{ "error": "Only the team lead can update the team description" }` |

#### Team Members
| Method | Path | Params | Behaviour | Success JSON (example) | Error JSON (example) |
|--------|------|--------|-----------|-------------------------|----------------------|
| `GET` | `/teams/:team_id/members` | — | List team members (team lead only) | `[{ "id": 1, "name": "Taylor", "role": "team_lead" }, { "id": 2, "name": "Riley", "role": "team_member" }]` | `{ "error": "Only the team lead can view all members" }` |
| `POST` | `/teams/:team_id/members` | `existing_user_id` OR `name`, `email`, `password`, `password_confirmation` | Add existing user or create new member | User JSON object | `{ "error": "Only the team lead can add members" }` or `{ "errors": ["Email has already been taken"] }` |
| `DELETE` | `/teams/:team_id/members/:id` | — | Remove member from team (team lead only, cannot remove self) | `{ "message": "User removed from team" }` | `{ "error": "Team lead cannot remove themselves" }` |

#### Tasks
| Method | Path | Params | Behaviour | Success JSON (example) | Error JSON (example) |
|--------|------|--------|-----------|-------------------------|----------------------|
| `GET` | `/tasks` | — | List tasks for requester's team | `[ { "id": 1001, "description": "Build feature", "current_state": "UNASSIGNED", "all_states": "UNASSIGNED,ASSIGNED,COMPLETED", "team_id": 1 } ]` | `{ "error": "User is not part of a team" }` |
| `POST` | `/tasks` | `due_date`, `points`, `description?`, `required_skills?`, `needs_validation?`, `all_states?`, `user_id?` | Create task (team lead only) | Task JSON object | `{ "error": "Only team leads can create tasks" }` or `{ "errors": ["Due date can't be in the past"] }` |
| `GET` | `/tasks/:id` | — | Get a single task in same team | Task JSON object | `{ "error": "Not authorized" }` |
| `PATCH` / `PUT` | `/tasks/:id` | `description?`, `points?` | Update description/points (creator lead only) | Task JSON object | `{ "error": "Only the creating team lead can update this task" }` |
| `DELETE` | `/tasks/:id` | — | Delete task (creator lead only) | `204 No Content` | `{ "error": "Only the creating team lead can delete this task" }` |
| `POST` | `/tasks/:id/assign` | `user_id?` | Self-assign or assign teammate (lead) | Task JSON object | `{ "error": "Task is already assigned" }` or `{ "errors": ["...validation..."] }` |
| `DELETE` | `/tasks/:id/unassign` | — | Assigned user gives up task | `204 No Content` | `{ "error": "You are not assigned to this task" }` |
| `POST` | `/tasks/:id/progress` | — | Move to next state; pending approval when `needs_validation=true` | Immediate: Task JSON object. Pending: `{ "message": "Transition is pending team lead approval", "task": { ...task } }` (`202 Accepted`) | `{ "error": "Only the assigned user can progress this task" }` or `{ "errors": ["..."] }` |
| `GET` | `/tasks/scores` | `user_id` | Per-task score for user in same team | `[ { "task_id": 1001, "description": "Build feature", "current_state": "ASSIGNED", "points": 5, "user_score": 0 } ]` | `{ "error": "Not authorized" }` |

#### Task Transition Pendings
| Method | Path | Params | Behaviour | Success JSON (example) | Error JSON (example) |
|--------|------|--------|-----------|-------------------------|----------------------|
| `GET` | `/task_transition_pendings` | — | List pending approvals assigned to current approver | `[ { "id": 2001, "task_id": 1001, "requested_by_id": 2, "approved_by_id": 1, "from_state": "ASSIGNED", "to_state": "DEVELOPMENT", "status": "pending" } ]` | Devise auth error |
| `POST` | `/task_transition_pendings/:id/approve` | — | Approve pending transition | Pending record JSON object (status becomes `approved`) | `{ "error": "Not authorized" }` or `{ "errors": ["..."] }` |
| `POST` | `/task_transition_pendings/:id/reject` | — | Reject pending transition | Pending record JSON object (status becomes `rejected`) | `{ "error": "Not authorized" }` |

#### System And Utility Routes
| Method | Path | Behaviour | Output |
|--------|------|-----------|--------|
| `GET` | `/` | Root page | HTML from `welcome#index` |
| `GET` | `/welcome/index` | Welcome page | HTML |
| `GET` | `/up` | Rails health check | Health JSON/HTML response from Rails health controller |

Notes:

- Internal Rails/Turbo/ActiveStorage/ActionMailbox routes (for example under `/rails/...`, `/recede_historical_location`) are framework-provided and are omitted from API documentation.
- For protected routes, unauthenticated requests are handled by Devise and may return an authentication error/redirect depending on request format.

### Task Workflow States

`Task` now stores workflow directly in two fields:

- `all_states`: comma-separated list of states the task can go through.
- `current_state`: current position in that workflow.

Allowed state set and order are predetermined:

`UNASSIGNED -> ASSIGNED -> DEVELOPMENT -> TESTING -> PRODUCTION -> COMPLETED`

Rules:

- Every task always includes `UNASSIGNED`, `ASSIGNED`, and `COMPLETED`.
- Optional states are `DEVELOPMENT`, `TESTING`, `PRODUCTION` and are selected at task creation time.
- Optional states are normalized to the predetermined order, regardless of input order.
- Progression must be sequential; skipping states is not allowed.
