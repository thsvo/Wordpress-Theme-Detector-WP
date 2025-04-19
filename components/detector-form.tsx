"use client"

import type React from "react"

import { useState } from "react"
import { detectWordPress } from "@/lib/detect-wordpress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DetectorForm() {
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<{
    isWordPress: boolean
    indicators: string[]
    plugins?: Array<{ name: string; url: string }>
    theme?: { name: string; url: string } | null
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Basic URL validation
    if (!url.trim() || !url.match(/^https?:\/\/.+\..+/)) {
      setResult({
        isWordPress: false,
        indicators: [],
        error: "Please enter a valid URL (including http:// or https://)",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const detectionResult = await detectWordPress(url)
      setResult(detectionResult)
    } catch (error) {
      setResult({
        isWordPress: false,
        indicators: [],
        error: "Failed to analyze the website. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Card className="shadow-md mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Website URL
              </label>
              <div className="flex space-x-2">
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
            </div>

            {result?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {result && !result.error && (
        <div className="space-y-6">
          <Alert variant={result.isWordPress ? "default" : "destructive"} className="mb-6">
            {result.isWordPress ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.isWordPress ? "WordPress Detected!" : "Not a WordPress Site"}</AlertTitle>
            <AlertDescription>
              {result.isWordPress 
                ? "We've detected WordPress on this site. See details below." 
                : "No WordPress indicators were found on this website."}
            </AlertDescription>
          </Alert>

          {result.isWordPress && (
            <Tabs defaultValue="plugins" className="w-full">
              <TabsList className="mb-4">
                {/* <TabsTrigger value="indicators">Indicators</TabsTrigger> */}
                <TabsTrigger value="plugins">
                  Plugins {result.plugins && result.plugins.length > 0 && `(${result.plugins.length})`}
                </TabsTrigger>
                <TabsTrigger value="theme">Theme</TabsTrigger>
              </TabsList>
              
              {/* <TabsContent value="indicators">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {result.indicators.map((indicator, index) => (
                        <li key={index}>{indicator}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent> */}
              
              <TabsContent value="plugins">
                {result.plugins && result.plugins.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.plugins.map((plugin, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                            <img 
                              src={`/plugin.jpg`} 
                              alt={`${plugin.name} plugin`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <h3 className="font-medium text-sm mb-1 truncate">{plugin.name}</h3>
                          <a
                            href={plugin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs flex items-center"
                          >
                            View details
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">No plugins detected.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="theme">
                <Card>
                  <CardContent className="pt-6">
                    {result.theme ? (
                      <div className="flex items-center space-x-3">
                        <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium">{result.theme.name}</h3>
                          <a
                            href={result.theme.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            View theme
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No theme detected.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  )
}
