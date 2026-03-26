# CSCI3100 - Group 25

## Documentation

### Routes

#### Authentication (Via Devise)
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `POST` | `/users/sign_in` | `email`, `password` | Log in an existing user. Returns user details on success, `401 Unauthorized` on failure |
| `DELETE` | `/users/sign_out` | — | Log out the current user |
| `POST` | `/users/password` | `email` | Send password reset instructions to the given email. Returns `200 OK` if email is found, `422 Unprocessable Content` otherwise |
| `PATCH` / `PUT` | `/users/password` | `reset_password_token`, `password`, `password_confirmation` | Reset the user’s password |
| `POST` | `/users` | `name`, `email`, `password`, `password_confirmation`, `role?` | Create a new non-guest user account |
| `PATCH` / `PUT` | `/users` | `email`, `password`, etc. | Update the current user’s account details |
| `DELETE` | `/users` | — | Delete the current user account |

#### Users
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `GET` | `/users/:id` | — | Return user info including their team |
| `PATCH` | `/users/:id` | `name` | Update the user's name |

#### Teams
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `POST` | `/teams` | `name`, `description?` | Create a team; requesting user becomes team lead |
| `GET` | `/teams/:id` | — | Return team info + leads; requester must be a member |
| `PATCH` | `/teams/:id` | `description` | Update team description; team lead only |

#### Team Members
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `GET` | `/teams/:team_id/members` | — | List all members; team lead only |
| `POST` | `/teams/:team_id/members` | `existing_user_id` OR `name` | Add existing user or create new member; team lead only |
| `DELETE` | `/teams/:team_id/members/:id` | — | Remove member from team; team lead only, cannot remove self |

#### Tasks
| Method | Path | Params | Behaviour |
|--------|------|--------|-----------|
| `GET` | `/tasks` | — | List all tasks for the requester's team |
| `POST` | `/tasks` | `due_date`, `points`, `description?`, `required_skills?`, `needs_validation?`, `all_states?`, `user_id?` | Create task; team lead only; `team_id` and `created_by` are auto-set; `due_date` must be today or later; required skills are normalized and immutable after creation; optional workflow states can be opted in via `all_states` |
| `GET` | `/tasks/:id` | — | Return task; requester must be in the same team |
| `PATCH` | `/tasks/:id` | `description?`, `points?` | Update description or points; creating team lead only |
| `DELETE` | `/tasks/:id` | — | Delete task; creating team lead only |
| `POST` | `/tasks/:id/assign` | `user_id?` | Assign task to requester, or to a specified teammate when caller is a team lead; assignee skills must satisfy required skills |
| `DELETE` | `/tasks/:id/unassign` | — | Give up an assigned task; assigned user only |
| `POST` | `/tasks/:id/progress` | — | Move task to the next state in `all_states`; if `needs_validation=true`, creates a pending transition for team lead approval |
| `GET` | `/tasks/scores` | `user_id` | Return per-task score for a specific user within their team |

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
