# Scene and Role Surfaces Mapping

This document details how SillyTavern represents groups and how Taverna-v2 maps functional roles on top of them for Phase 9.

## SillyTavern Native Surfaces: Groups

### Source of Truth
- **Filesystem**: `data/[user]/groups/*.json`. Each file is a group definition.
- **Backend API**:
  - `POST /api/groups/all`: Returns all group definitions.
  - `POST /api/groups/create`: Creates new group.
  - `POST /api/groups/edit`: Overwrites existing group metadata.
  - `POST /api/groups/delete`: Removes group and its associated chat files.

### Group Observation
- **State**: Taverna observes a group by its `id`, `name`, and `members` (avatar filenames).
- **Participants**: Members are an array of character avatar names (e.g., `["Nova.png", "Byte.png"]`).

### Group Mutation
- **Action**: Adding/Removing members via `group.update_members` (Taverna) maps to `POST /api/groups/edit` with a modified `members` array.
- **Verification**: Re-reading `group.all` and checking the `members` array against intent.

## Taverna Layer: Roles and Scenes

SillyTavern does NOT have a native concept of "functional roles" (Master, Player, Narrator). 
Taverna-v2 establishes this layer as a virtual governance structure.

### Role Mapping (Virtual)
Taverna maintains a role-to-participant mapping. 
- **Master**: The entity responsible for world state and plot. Usually a high-instruct model.
- **Player**: The human user's persona in the scene.
- **Character**: Active NPCs in the group.
- **Narrator**: Descriptive/Atmospheric entity.
- **System**: Technical/Logic entity.

### Scene Representation
A **Scene** in Taverna is the composite of:
1. A SillyTavern **Group** (participants).
2. A SillyTavern **Chat** (active context/history).
3. A Taverna **Role Policy** (assigned models/presets per participant/role).

### Status Table

| Surface | Observation | Mutation | Verification | Rollback | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Group Metadata** | `/api/groups/all` | `/api/groups/edit` | Re-read | Partial | Gobernable |
| **Members** | Group `members` array | `/api/groups/edit` | Re-read | Full | Gobernable |
| **Roles** | Taverna Config | Taverna API | Internal Check | Full | Gobernable (Virtual) |
| **Model Assignment** | Taverna Config | `role.assign_model` | Internal Check | Full | Gobernable (Virtual) |

## Risks and Limitations
- **Race Conditions**: Parallel edits to groups in the ST UI and Taverna can cause state drift.
- **UI Sync**: Changes to groups via API may require a UI refresh in SillyTavern to be visible to the user.
- **Destructive Deletion**: Group deletion also removes linked chat history. Taverna must exercise extreme caution.
