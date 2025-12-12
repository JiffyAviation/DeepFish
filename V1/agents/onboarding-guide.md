# Agent Onboarding Form - Usage Guide

## Access the Form

The agent onboarding form is available at: **`/add-agent`** (when deployed)

Or you can import it into any page:
```jsx
import NewAgentForm from './components/NewAgentForm';
```

## How to Use

### 1. Fill Out Agent Details
- **Agent Name**: e.g., "Einstein", "Newton", "Darwin"
- **Role/Title**: e.g., "Theoretical Physicist", "Mathematician"  
- **Specialty**: Describe what this agent will focus on
- **Color**: Pick a unique color for the agent's theme

### 2. Add Training Materials
- Click "+ Add Another Source" for multiple sources
- Supported types:
  - YouTube Channel
  - Single YouTube Video
  - Website
  - Document/PDF
  - Book

### 3. Submit
- Form generates a JSON config file
- **Download automatically starts**
- File name: `{agent-name}-training-config.json`

### 4. Commit to Repository
1. Move the downloaded JSON file to: `/agents/` folder
2. Run: `git add agents/{agent-name}-training-config.json`
3. Commit: `git commit -m "Add {agent-name} training config"`
4. Push: `git push origin main`

### 5. Oracle Processing
- Oracle monitors the `/agents/` folder
- New configs are added to the **training queue**
- Training starts in the **next Oracle cycle**
- Agent appears on carousel once training completes

## Example Workflow

```
1. You fill out form for "Newton" (mathematician)
2. Add YouTube channel about calculus
3. Submit → downloads newton-training-config.json
4. Move file to /agents/ folder
5. Commit and push to GitHub
6. Oracle picks it up next cycle
7. Newton appears on team carousel after training
```

## Config File Location
All training configs should be in: `/agents/`

Oracle watches this folder for new JSON files!
