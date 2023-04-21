import { Tool } from 'langchain/tools';
import { google } from 'googleapis';

class GoogleSerpAPI extends Tool {
  private apiKey: string;
  private engineId: string;
  private count = 5;
  name = 'google-search';
  description =
    'a search engine. useful for when you need to answer questions about current events. input should be a search query.';

  constructor(
    apiKey: string = process.env.GoogleAPIKey ?? '',
    engineId: string = process.env.GoogleCustomSearchEngineId ?? ''
  ) {
    super();

    if (!apiKey || !engineId) {
      throw new Error(
        'neither GoogleSerpAPI API key nor GoogleCustomSearchEngineId not set. You can set it as GoogleAPIKey and GoogleCustomSearchEngineId in your .env file.'
      );
    }

    this.apiKey = apiKey;
    this.engineId = engineId;
  }
  async _call(input: string): Promise<string> {
    const customsearch = google.customsearch('v1');
    const res = await customsearch.cse.list({
      auth: this.apiKey,
      q: input,
      cx: this.engineId,
    });

    if (!res.data.items || (res.data.items && res.data.items.length === 0)) {
      return 'No good results found.';
    }

    const snippets = res.data.items
      // get the first 5 results
      .slice(0, this.count)
      .map((item) => item.snippet);

    console.log(
      `gpt trigger search query:${input}, result snippets: ${snippets}`
    );

    return snippets.join(' ');
  }
}

export { GoogleSerpAPI };
