import { NextResponse } from "next/server"
import { parse } from "node-html-parser"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        // Set a user agent to avoid being blocked
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          isWordPress: false,
          indicators: [],
          plugins: [],
          theme: null,
          error: `Failed to fetch website: ${response.status} ${response.statusText}`,
        },
        { status: 200 },
      )
    }

    const html = await response.text()
    const baseUrl = new URL(url).origin

    // Parse the HTML for more accurate detection
    const root = parse(html)

    // Check for WordPress indicators
    const indicators: string[] = []

    // Check for wp-content directory
    if (html.includes("/wp-content/")) {
      indicators.push("Found '/wp-content/' directory references")
    }

    // Check for wp-includes directory
    if (html.includes("/wp-includes/")) {
      indicators.push("Found '/wp-includes/' directory references")
    }

    // Check for WordPress meta generator tag
    const metaGeneratorMatch = html.match(/<meta\s+name=["']generator["']\s+content=["']WordPress[^"']*["']/i)
    if (metaGeneratorMatch) {
      indicators.push("Found WordPress meta generator tag")
    }

    // Check for WordPress REST API
    if (html.includes("/wp-json/")) {
      indicators.push("Found WordPress REST API endpoint (/wp-json/)")
    }

    // Check for common WordPress classes
    if (html.includes("wp-block") || html.includes("wp-embed")) {
      indicators.push("Found WordPress-specific CSS classes")
    }

    // Check for WordPress admin links
    if (html.includes("/wp-admin/") || html.includes("/wp-login.php")) {
      indicators.push("Found WordPress admin/login links")
    }

    // Detect plugins - more comprehensive approach
    const plugins: Array<{ name: string; url: string }> = []
    const foundPlugins = new Set()

    // Method 1: Check for plugin paths in script and link tags
    const scriptTags = root.querySelectorAll("script[src]")
    const linkTags = root.querySelectorAll("link[href]")

    // Function to extract plugin from URL
    const extractPlugin = (src: string) => {
      const pluginMatch = src.match(/\/wp-content\/plugins\/([^/?"']+)/)
      if (pluginMatch && pluginMatch[1]) {
        const pluginName = pluginMatch[1]
        if (!foundPlugins.has(pluginName)) {
          foundPlugins.add(pluginName)
          plugins.push({
            name: formatName(pluginName),
            url: `${baseUrl}/wp-content/plugins/${pluginName}/`,
          })
        }
      }
    }

    // Check script tags
    scriptTags.forEach((script) => {
      const src = script.getAttribute("src") || ""
      extractPlugin(src)
    })

    // Check link tags
    linkTags.forEach((link) => {
      const href = link.getAttribute("href") || ""
      extractPlugin(href)
    })

    // Method 2: Regular expression to find all plugin references in HTML
    const pluginRegexPatterns = [
      /\/wp-content\/plugins\/([^/?"']+)/g,
      /plugins\/([^/?"']+)\/assets/g,
      /plugins\/([^/?"']+)\/js/g,
      /plugins\/([^/?"']+)\/css/g,
    ]

    pluginRegexPatterns.forEach((regex) => {
      let match
      while ((match = regex.exec(html)) !== null) {
        const pluginName = match[1]
        if (!foundPlugins.has(pluginName)) {
          foundPlugins.add(pluginName)
          plugins.push({
            name: formatName(pluginName),
            url: `${baseUrl}/wp-content/plugins/${pluginName}/`,
          })
        }
      }
    })

    // Method 3: Look for plugin-specific HTML comments
    const commentRegex = /<!--\s*(?:plugin|start):\s*([^/\s]+)\s*-->/gi
    let commentMatch
    while ((commentMatch = commentRegex.exec(html)) !== null) {
      const pluginName = commentMatch[1].trim()
      if (pluginName && !foundPlugins.has(pluginName)) {
        foundPlugins.add(pluginName)
        plugins.push({
          name: formatName(pluginName),
          url: `${baseUrl}/wp-content/plugins/${pluginName}/`,
        })
      }
    }

    // Method 4: Look for plugin-specific JavaScript variables
    const jsVarRegex = /var\s+([a-zA-Z0-9_]+)_plugin/g
    let jsVarMatch
    while ((jsVarMatch = jsVarRegex.exec(html)) !== null) {
      const pluginName = jsVarMatch[1].trim()
      if (pluginName && !foundPlugins.has(pluginName)) {
        foundPlugins.add(pluginName)
        plugins.push({
          name: formatName(pluginName),
          url: `${baseUrl}/wp-content/plugins/${pluginName}/`,
        })
      }
    }

    // Method 5: Detect specific popular plugins by their signatures
    detectSpecificPlugins(html, root, plugins, foundPlugins as Set<string>, baseUrl)

    // Detect theme
    let theme: { name: string; url: string } | null = null
    const themeRegex = /\/wp-content\/themes\/([^/?"']+)/
    const themeMatch = html.match(themeRegex)

    if (themeMatch && themeMatch[1]) {
      theme = {
        name: formatName(themeMatch[1]),
        url: `${baseUrl}/wp-content/themes/${themeMatch[1]}/`,
      }
    }

    // Check for theme in style.css link
    if (!theme) {
      const styleRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*\/themes\/([^/?"']+)[^"']*)["']/i
      const styleMatch = html.match(styleRegex)
      if (styleMatch && styleMatch[2]) {
        theme = {
          name: formatName(styleMatch[2]),
          url: styleMatch[1].startsWith("http") ? styleMatch[1] : `${baseUrl}${styleMatch[1]}`,
        }
      }
    }

    return NextResponse.json({
      isWordPress: indicators.length > 0,
      indicators,
      plugins,
      theme,
    })
  } catch (error) {
    
    return NextResponse.json(
      {
        isWordPress: false,
        indicators: [],
        plugins: [],
        theme: null,
        error: "Failed to analyze the website",
      },
      { status: 200 },
    )
  }
}

// Helper function to format plugin/theme names
function formatName(name: string): string {
  return name
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Function to detect specific popular plugins by their signatures
function detectSpecificPlugins(
  html: string,
  root: any,
  plugins: Array<{ name: string; url: string }>,
  foundPlugins: Set<string>,
  baseUrl: string,
) {
  // Detect HubSpot
  if (
    html.includes("hubspot") ||
    html.includes("hs-script") ||
    html.includes("hs-analytics") ||
    html.includes("_hsq") ||
    html.match(/script[^>]*hubspot\.com/)
  ) {
    if (!foundPlugins.has("hubspot")) {
      foundPlugins.add("hubspot")
      plugins.push({
        name: "HubSpot",
        url: "https://www.hubspot.com/products/wordpress",
      })
    }
  }

  // Detect Rank Math SEO
  if (
    html.includes("rank-math") ||
    html.includes("rankMath") ||
    html.includes("Rank Math SEO") ||
    root.querySelector('meta[name="rank-math-schema"]') ||
    html.match(/rank-math-js-before/) ||
    html.match(/rankmath/)
  ) {
    if (!foundPlugins.has("rank-math-seo")) {
      foundPlugins.add("rank-math-seo")
      plugins.push({
        name: "Rank Math SEO",
        url: `${baseUrl}/wp-content/plugins/seo-by-rank-math/`,
      })
    }
  }

  // Detect Site Kit by Google
  if (
    html.includes("google-site-kit") ||
    html.includes("googleSiteKit") ||
    html.includes("google_tag_data") ||
    html.match(/site-kit-by-google/) ||
    root.querySelector('meta[name="google-site-verification"]')
  ) {
    if (!foundPlugins.has("google-site-kit")) {
      foundPlugins.add("google-site-kit")
      plugins.push({
        name: "Site Kit by Google",
        url: `${baseUrl}/wp-content/plugins/google-site-kit/`,
      })
    }
  }

  // Detect Yoast SEO
  if (
    html.includes("yoast") ||
    html.includes("wpseo") ||
    html.includes("Yoast SEO plugin") ||
    root.querySelector('meta[property="og:site_name"]')?.getAttribute("content")?.includes("Yoast") ||
    html.match(/yoast-seo/) ||
    html.match(/wp-seo\.js/)
  ) {
    if (!foundPlugins.has("wordpress-seo")) {
      foundPlugins.add("wordpress-seo")
      plugins.push({
        name: "Yoast SEO",
        url: `${baseUrl}/wp-content/plugins/wordpress-seo/`,
      })
    }
  }

  // Detect WooCommerce
  if (
    html.includes("woocommerce") ||
    html.includes("WooCommerce") ||
    html.includes("wc-") ||
    html.includes("wc_") ||
    root.querySelector(".woocommerce") ||
    html.match(/is-woocommerce/) ||
    html.match(/wc-block/)
  ) {
    if (!foundPlugins.has("woocommerce")) {
      foundPlugins.add("woocommerce")
      plugins.push({
        name: "WooCommerce",
        url: `${baseUrl}/wp-content/plugins/woocommerce/`,
      })
    }
  }

  // Detect Contact Form 7
  if (
    html.includes("wpcf7") ||
    html.includes("contact-form-7") ||
    html.match(/wpcf7-form/) ||
    html.match(/wpcf7_validate/)
  ) {
    if (!foundPlugins.has("contact-form-7")) {
      foundPlugins.add("contact-form-7")
      plugins.push({
        name: "Contact Form 7",
        url: `${baseUrl}/wp-content/plugins/contact-form-7/`,
      })
    }
  }

  // Detect Elementor
  if (
    html.includes("elementor") ||
    html.includes("Elementor") ||
    html.match(/elementor-widget/) ||
    html.match(/elementor-page/) ||
    root.querySelector(".elementor")
  ) {
    if (!foundPlugins.has("elementor")) {
      foundPlugins.add("elementor")
      plugins.push({
        name: "Elementor",
        url: `${baseUrl}/wp-content/plugins/elementor/`,
      })
    }
  }

  // Detect Jetpack
  if (
    html.includes("jetpack") ||
    html.includes("Jetpack") ||
    html.match(/jp-carousel/) ||
    html.match(/jetpack_remote_comment/) ||
    html.match(/jetpack-lazy-images/)
  ) {
    if (!foundPlugins.has("jetpack")) {
      foundPlugins.add("jetpack")
      plugins.push({
        name: "Jetpack",
        url: `${baseUrl}/wp-content/plugins/jetpack/`,
      })
    }
  }

  // Detect Akismet
  if (
    html.includes("akismet") ||
    html.includes("Akismet") ||
    html.match(/akismet_comment_nonce/) ||
    html.match(/akismet_comment_form/)
  ) {
    if (!foundPlugins.has("akismet")) {
      foundPlugins.add("akismet")
      plugins.push({
        name: "Akismet Anti-Spam",
        url: `${baseUrl}/wp-content/plugins/akismet/`,
      })
    }
  }

  // Detect Wordfence
  if (
    html.includes("wordfence") ||
    html.includes("Wordfence") ||
    html.match(/wfwaf-/) ||
    html.match(/wordfence_logHuman/)
  ) {
    if (!foundPlugins.has("wordfence")) {
      foundPlugins.add("wordfence")
      plugins.push({
        name: "Wordfence Security",
        url: `${baseUrl}/wp-content/plugins/wordfence/`,
      })
    }
  }

  // Detect MonsterInsights (Google Analytics)
  if (
    html.includes("monsterinsights") ||
    html.includes("MonsterInsights") ||
    html.match(/mi-track-download/) ||
    html.match(/monsterinsights_frontend/)
  ) {
    if (!foundPlugins.has("google-analytics-for-wordpress")) {
      foundPlugins.add("google-analytics-for-wordpress")
      plugins.push({
        name: "MonsterInsights",
        url: `${baseUrl}/wp-content/plugins/google-analytics-for-wordpress/`,
      })
    }
  }

  // Detect WP Rocket
  if (
    html.includes("wp-rocket") ||
    html.includes("WP Rocket") ||
    html.match(/rocket-browser-checker/) ||
    html.match(/wp-rocket\/assets/)
  ) {
    if (!foundPlugins.has("wp-rocket")) {
      foundPlugins.add("wp-rocket")
      plugins.push({
        name: "WP Rocket",
        url: `${baseUrl}/wp-content/plugins/wp-rocket/`,
      })
    }
  }

  // Detect Advanced Custom Fields (ACF)
  if (
    html.includes("acf-") ||
    html.includes("acf_") ||
    html.match(/advanced-custom-fields/) ||
    html.match(/acf-field/)
  ) {
    if (!foundPlugins.has("advanced-custom-fields")) {
      foundPlugins.add("advanced-custom-fields")
      plugins.push({
        name: "Advanced Custom Fields",
        url: `${baseUrl}/wp-content/plugins/advanced-custom-fields/`,
      })
    }
  }

  // Detect WPForms
  if (
    html.includes("wpforms") ||
    html.includes("WPForms") ||
    html.match(/wpforms-field/) ||
    html.match(/wpforms-container/)
  ) {
    if (!foundPlugins.has("wpforms-lite")) {
      foundPlugins.add("wpforms-lite")
      plugins.push({
        name: "WPForms",
        url: `${baseUrl}/wp-content/plugins/wpforms-lite/`,
      })
    }
  }

  // Detect Gravity Forms
  if (
    html.includes("gform_") ||
    html.includes("gravity-forms") ||
    html.match(/gform_wrapper/) ||
    html.match(/gform_confirmation_message/)
  ) {
    if (!foundPlugins.has("gravityforms")) {
      foundPlugins.add("gravityforms")
      plugins.push({
        name: "Gravity Forms",
        url: `${baseUrl}/wp-content/plugins/gravityforms/`,
      })
    }
  }
}
