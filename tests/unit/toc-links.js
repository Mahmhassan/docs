import { jest } from '@jest/globals'
import { loadPages } from '../../lib/page-data.js'
import renderContent from '../../lib/render-content/index.js'
import { allVersionKeys } from '../../lib/all-versions.js'
import loadSiteData from '../../lib/site-data.js'

describe('toc links', () => {
  jest.setTimeout(3 * 60 * 1000)

  const siteData = loadSiteData()

  test('every toc link works without redirects', async () => {
    const pages = await loadPages()

    const englishIndexPages = pages.filter(
      (page) => page.languageCode === 'en' && page.relativePath.endsWith('index.md')
    )

    const issues = []

    for (const pageVersion of allVersionKeys) {
      for (const page of englishIndexPages) {
        // skip page if it doesn't have a permalink for the current product version
        if (!page.permalinks.some((permalink) => permalink.pageVersion === pageVersion)) continue

        // build fake context object for rendering the page
        const context = {
          page,
          pages,
          redirects: {},
          currentLanguage: 'en',
          currentVersion: pageVersion,
          site: siteData.en.site,
        }

        // ensure all toc pages can render
        try {
          await renderContent(page.markdown, context)
        } catch (err) {
          issues.push({
            'TOC path': page.relativePath,
            error: err.message,
            pageVersion,
          })
        }
      }
    }

    const message = 'broken link in a TOC: ' + JSON.stringify(issues, null, 2)
    expect(issues.length, message).toBe(0)
  })
})
