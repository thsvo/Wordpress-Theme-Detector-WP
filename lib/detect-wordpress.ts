export async function detectWordPress(url: string) {
  try {
    // Make a server-side request to the URL
    const response = await fetch("/api/check-wordpress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch website")
    }

    return await response.json()
  } catch (error) {
    console.error("Error detecting WordPress:", error)
    throw error
  }
}
