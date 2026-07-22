(function () {
  "use strict";

  const FAVORITES = new Set(["steam", "xbox", "call-of-duty", "spotify", "youtube", "figma", "chatgpt", "files"]);
  const groups = [
    ["Games District", [
      ["steam", "Steam", "steam", "Game library"],
      ["xbox", "Xbox", "xbox", "Game service"],
      ["call-of-duty", "Call of Duty", "target", "Mission profile"],
      ["epic-games", "Epic Games", "gamepad", "Game library"],
      ["battle-net", "Battle.net", "target", "Game library"],
      ["ea", "EA", "gamepad", "Game library"]
    ]],
    ["Browser District", [
      ["chrome", "Chrome", "chrome", "Primary browser"]
    ]],
    ["Media District", [
      ["spotify", "Spotify", "spotify", "Music portal"],
      ["youtube", "YouTube", "youtube", "Video portal"],
      ["discord", "Discord", "discord", "Voice stack"],
      ["netflix", "Netflix", "stream", "Video portal"],
      ["plex", "Plex", "plex", "Media library"],
      ["twitch", "Twitch", "video", "Live portal"],
      ["prime-video", "Prime Video", "video", "Video portal"]
    ]],
    ["Creative District", [
      ["figma", "Figma", "figma", "Design studio"],
      ["adobe", "Adobe", "spark", "Creative suite"],
      ["vs-code", "VS Code", "code", "Development module"],
      ["blender", "Blender", "layers", "3D studio"],
      ["canva", "Canva", "image", "Design portal"],
      ["obsidian", "Obsidian", "obs", "Knowledge studio"]
    ]],
    ["AI District", [
      ["chatgpt", "ChatGPT", "spark", "Reasoning workspace"],
      ["copilot", "Copilot", "blocks", "Work assistant"]
    ]],
    ["System District", [
      ["files", "Files", "folder", "File system portal"],
      ["task-manager", "Task Manager", "tasks", "Process overview"],
      ["settings", "Settings", "settings", "System control"],
      ["terminal", "Terminal", "terminal", "Command portal"],
      ["powershell", "PowerShell", "terminal", "Command portal"],
      ["performance", "Performance", "gauge", "System overview"],
      ["documents", "Documents", "document", "Folder portal"],
      ["downloads", "Downloads", "download", "Folder portal"],
      ["calculator", "Calculator", "calculator", "Utility"],
      ["notepad", "Notepad", "document", "Utility"],
      ["snipping-tool", "Snipping Tool", "image", "Capture utility"],
      ["photos", "Photos", "image", "Media utility"],
      ["mail", "Mail", "document", "Communication portal"],
      ["calendar", "Calendar", "tasks", "Planning portal"],
      ["weather", "Weather", "lighting", "Information portal"],
      ["clock", "Clock", "gauge", "Utility"],
      ["control-panel", "Control Panel", "sliders", "System portal"]
    ]]
  ];

  const commands = groups.flatMap(([district, items]) => items.map(([id, label, icon, role]) => ({
    id,
    label,
    district,
    icon_source: `ruca-svg:${icon}`,
    role,
    availability: "READY",
    failure_state: "PUBLIC DEMO",
    launch_method: "safe browser-local simulation",
    primary_target: null,
    fallback_target: null,
    primary_available: false,
    fallback_available: false,
    primary_display: "Public demo selection",
    fallback_display: "",
    favorite: FAVORITES.has(id)
  })));

  window.RUCA_PUBLIC_COMMAND_REGISTRY = Object.freeze({
    schema_version: 1,
    registry_owner: "RUCA PUBLIC PRODUCT SIMULATION",
    commands: Object.freeze(commands)
  });
})();
