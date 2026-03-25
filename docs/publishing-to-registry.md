# Publishing Your Mod

Kite Loader uses a fully decentralized, GitHub-driven public registry. This means managing, updating, and publishing your mods is entirely free and transparent.

## The Kite Registry
All mods are indexed from the official repository: [nitaybl/kite-loader-registry](https://github.com/nitaybl/kite-loader-registry) *(Note: this repository must be created to initialize the ecosystem).*

When you publish a mod, you submit a Pull Request (PR) to this registry containing your mod's metadata.

### 1. Prepare Your Mod
Ensure your mod is hosted publicly (e.g., your own GitHub repository) and includes a `mod.json` file in its root directory containing your entry point. Your repository must contain a `.zip` release or map directly to the `main` branch zip archive.

### 2. Fork the Registry
1. Navigate to the [Kite Loader Registry GitHub](https://github.com/nitaybl/kite-loader-registry).
2. Click **Fork** to copy the repository to your own account.

### 3. Construct Your Registry Entry
Inside the `registry.json` file on your forked repository, add a new JSON object to the array. 

**Pay close attention to what fields are required versus optional. If you miss a required field or use improper formatting, the automated GitHub Actions will automatically reject your PR.**

```json
{
  "id": "your-unique-mod-id",
  "name": "My Epic Mod",
  "author": "YourName",
  "type": "Plugin",
  "version": "1.0.0",
  "description": "An incredibly detailed description of exactly what your mod does and why people need it.",
  "repository": "https://github.com/YourName/YourModRepo",
  "download": "https://github.com/YourName/YourModRepo/archive/refs/heads/main.zip",
  "logo": "https://raw.githubusercontent.com/YourName/YourModRepo/main/logo.png",
  "tags": ["UI", "Utility"]
}
```

#### Schema Specifications:
- **`id`** *(Required)*: A unique, lowercase string with dashes instead of spaces. E.g., `discord-rich-presence`.
- **`name`** *(Required)*: The public display name of your mod.
- **`author`** *(Required)*: Your developer handle or team name.
- **`type`** *(Required)*: Must be exactly one of: `"Theme"`, `"Plugin"`, `"QoL"`, or `"Core"`.
- **`version`** *(Required)*: Strict semantic versioning number (e.g., `1.0.0`, `2.3.1`). The registry polls this constantly to push automated update patches to your users.
- **`description`** *(Required)*: A concise, compelling 1-2 sentence pitch for your mod.
- **`repository`** *(Required)*: A direct URL to your GitHub or Gitlab repository for open-source review.
- **`download`** *(Required)*: A direct `.zip` download link to the exact build you want to publish.
- **`logo`** *(Optional)*: A direct URL to a square `.png` or `.jpg` file (ideally `256x256`). If omitted, a dynamic fallback abstraction is generated.
- **`tags`** *(Optional)*: An array of up to 3 strings used for categorization and filtering in the global Discover page.

### 4. Submit a Pull Request
1. Commit your changes to your fork.
2. Open a **Pull Request** targeting the `main` branch of the official `kite-loader-registry`.
3. Provide a brief description of your mod in the PR text.
4. Our automated GitHub Actions will instantly validate your JSON syntax. 
5. Once a core administrator clicks **Merge**, your plugin will instantly populate globally on the `Discover Mods` page inside the Kite Loader ecosystem!
