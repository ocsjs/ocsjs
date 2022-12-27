import { CDPSession, chromium, Page } from 'playwright-core';
import { Protocol } from 'playwright-core/types/protocol';

export class PageScreencaster {
	client?: CDPSession;
	page?: Page;
	params: Protocol.Page.startScreencastParameters;
	onScreencast: (data: { base64: string }) => void;

	constructor(params: Protocol.Page.startScreencastParameters, onScreencast: (data: { base64: string }) => void) {
		this.params = params;
		this.onScreencast = onScreencast;
	}

	async start(page: Page) {
		this.page = page;
		const client = await page.context().newCDPSession(page);
		client
			.on('Page.screencastFrame', async ({ sessionId, data: base64 }) => {
				if (!this.page?.isClosed()) {
					this.onScreencast?.({ base64 });
					await this.client?.send('Page.screencastFrameAck', { sessionId });
				}
			})
			.send('Page.startScreencast', this.params);
		this.client = client;
	}

	async stop() {
		if (!this.page?.isClosed()) {
			await this.client?.send('Page.stopScreencast');
		}
	}
}
