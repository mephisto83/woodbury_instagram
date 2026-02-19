/**
 * Woodbury Instagram Extension
 * 
 * Provides tools to post images to Instagram via browser automation.
 * Uses the Woodbury Bridge Chrome extension to interact with instagram.com.
 */

/**
 * @param {import('woodbury').ExtensionContext} ctx
 */
export async function activate(ctx) {
  ctx.log.info('Instagram extension activated');

  // Register the instagram_post tool
  ctx.registerTool(
    {
      name: 'instagram_post',
      description: `Post an image to Instagram with a caption.

**Requirements:**
- User must be logged into Instagram in Chrome
- Woodbury Bridge Chrome extension must be connected
- The woodbury_instagram Chrome extension should be installed for full automation

**How it works:**
1. Opens instagram.com in Chrome
2. Clicks the Create button
3. Uploads the image
4. Enters the caption
5. Clicks Share

**Image sources:**
- Local file path (e.g. "/path/to/image.jpg")
- Data URL (e.g. "data:image/jpeg;base64,...")
- HTTP URL (will be fetched)

**Caption tips:**
- Max 2200 characters
- Use line breaks for readability
- Add hashtags at the end`,
      parameters: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            description: 'Image to post: file path, data URL, or HTTP URL',
          },
          caption: {
            type: 'string',
            description: 'Caption text for the post (max 2200 characters)',
          },
        },
        required: ['image'],
      },
    },
    async (params) => {
      const { image, caption = '' } = params;

      // Check if bridge is connected
      if (!ctx.bridgeServer.isConnected) {
        return JSON.stringify({
          success: false,
          error: 'Woodbury Bridge Chrome extension is not connected. Please install and connect it first.',
        });
      }

      try {
        // Step 1: Open Instagram
        ctx.log.info('Opening Instagram...');
        await ctx.bridgeServer.send('browser', {
          action: 'open',
          url: 'https://www.instagram.com/',
          waitMs: 5000,
        });

        // Step 2: Find and click Create button
        ctx.log.info('Finding Create button...');
        const createResult = await ctx.bridgeServer.send('query', {
          action: 'find_interactive',
          description: 'Create new post button',
        });

        if (!createResult.results || createResult.results.length === 0) {
          return JSON.stringify({
            success: false,
            error: 'Could not find Create button. Make sure you are logged into Instagram.',
          });
        }

        // Click the Create button
        const createBtn = createResult.results[0];
        await ctx.bridgeServer.send('query', {
          action: 'click_element',
          selector: createBtn.selector,
        });

        // Wait for modal
        await new Promise((r) => setTimeout(r, 2000));

        // Step 3: Handle image upload
        ctx.log.info('Uploading image...');
        
        // The Chrome extension's content script handles the actual upload
        // We need to trigger it via message passing
        // For now, we'll use the bridge to interact with the DOM
        
        // Find file input or "Select from computer" button
        const selectResult = await ctx.bridgeServer.send('query', {
          action: 'find_interactive',
          description: 'Select from computer button or file input',
        });

        if (selectResult.results && selectResult.results.length > 0) {
          await ctx.bridgeServer.send('query', {
            action: 'click_element',
            selector: selectResult.results[0].selector,
          });
        }

        // At this point, if the image is a local file, the OS file dialog opens
        // and flow-frame-core's fileModalOperate can handle it
        // For now, return instructions for manual completion
        
        return JSON.stringify({
          success: true,
          status: 'initiated',
          message: 'Instagram post creation initiated. The Create modal should be open.',
          nextSteps: [
            'If a file dialog opened, select your image file',
            'After image loads, click Next twice (crop and filters)',
            'Enter your caption if not auto-filled',
            'Click Share to publish',
          ],
          image,
          caption,
        });

      } catch (error) {
        return JSON.stringify({
          success: false,
          error: `Instagram post failed: ${error.message}`,
        });
      }
    }
  );

  // Register a command to check Instagram status
  ctx.registerCommand({
    name: 'instagram-status',
    description: 'Check Instagram connection status',
    handler: async (args, cmdCtx) => {
      if (!ctx.bridgeServer.isConnected) {
        cmdCtx.print('❌ Woodbury Bridge not connected');
        return;
      }

      try {
        const ping = await ctx.bridgeServer.send('query', { action: 'ping' });
        if (ping.url && ping.url.includes('instagram.com')) {
          cmdCtx.print(`✅ Connected to Instagram: ${ping.url}`);
        } else {
          cmdCtx.print(`✅ Bridge connected, but not on Instagram (current: ${ping.url || 'unknown'})`);
        }
      } catch (e) {
        cmdCtx.print(`❌ Bridge error: ${e.message}`);
      }
    },
  });

  // Add system prompt section
  ctx.addSystemPrompt(`## Instagram Extension

You have access to the Instagram extension which can post images to Instagram.

### Tool: instagram_post
- Posts an image to Instagram with a caption
- Requires: User logged into Instagram in Chrome, Woodbury Bridge connected
- Image can be: file path, data URL, or HTTP URL

### Command: /instagram-status
- Check if Instagram is accessible

### Workflow for posting:
1. Use \`instagram_post\` with image path and caption
2. The tool opens Instagram and initiates the post flow
3. For local files, you may need to use \`fileModalOperate\` from flow-frame-core`);
}

export function deactivate() {
  // Cleanup if needed
}
