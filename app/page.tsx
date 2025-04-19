"use client"

import { useEffect, useRef } from "react"
import { DetectorForm } from "@/components/detector-form"
import { gsap } from "gsap"
import * as THREE from "three"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Three.js setup
    if (canvasRef.current) {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        alpha: true,
      })
      
      renderer.setSize(window.innerWidth, window.innerHeight)
      
      // Create particles
      const particlesGeometry = new THREE.BufferGeometry()
      const particlesCount = 2000
      
      const posArray = new Float32Array(particlesCount * 3)
      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 5
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.005,
        color: '#8a6eff',
      })
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
      scene.add(particlesMesh)
      
      camera.position.z = 2
      
      // Animation
      const animate = () => {
        requestAnimationFrame(animate)
        particlesMesh.rotation.y += 0.001
        renderer.render(scene, camera)
      }
      
      animate()
      
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  useEffect(() => {
    // GSAP animations
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.feature-card')
      
      gsap.fromTo(
        cards,
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.2, 
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          }
        }
      )
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Transparent Header - Fixed position and transparent background */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-transparent backdrop-blur-sm py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-blue-600 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-xl font-medium">WordPress Detector</h1>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            {/* <a href="/docs" className="text-blue-600 hover:underline text-sm">Docs</a>
            <a href="/" className="text-blue-600 hover:underline text-sm">Features</a> */}
            <a href="https://codeopx.com/about" className="text-blue-600 hover:underline text-sm">About</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Add padding to account for fixed header */}
        <div className="pt-16">
          {/* Main content */}
          <div className="max-w-4xl mx-auto">
            {/* Search form */}
            <div className="mb-8">
              <DetectorForm />
            </div>
            
            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16" ref={cardsRef}>
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow feature-card">
                <div className="flex items-center mb-4">
                  {/* <img 
                    src="/images/product-support.jpg" 
                    alt="Product Support" 
                    className="w-12 h-12 object-cover rounded-full mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Crect width='24' height='24' rx='12'/%3E%3C/svg%3E";
                    }}
                  /> */}
                  <h3 className="font-medium">WordPress Detector</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Get help with WordPress detection and analysis</p>
                <Link href="/" className="text-blue-600 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {/* <img 
                    src="/images/wordpress-store.jpg" 
                    alt="WordPress Store" 
                    className="w-12 h-12 object-cover rounded-full mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Crect width='24' height='24' rx='12'/%3E%3C/svg%3E";
                    }}
                  /> */}
                  <h3 className="font-medium">WordPress Website Detector</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Discover premium WordPress themes and plugins</p>
                <Link href="/" className="text-blue-600 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {/* <img 
                    src="/images/account.jpg" 
                    alt="Your Account" 
                    className="w-12 h-12 object-cover rounded-full mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Crect width='24' height='24' rx='12'/%3E%3C/svg%3E";
                    }}
                  /> */}
                  <h3 className="font-medium">Wordpress Theme Detector</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Manage your WordPress Detector account</p>
                <Link href="/" className="text-blue-600 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Hero section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 mt-8">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-medium mb-4">Make your WordPress detection fast on all devices</h2>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium uppercase text-gray-500">CHECK OUT</h3>
                  
                  {/* <ul className="space-y-2">
                    <li>
                      <a href="/" className="text-blue-600 hover:underline">What's new</a>
                    </li>
                    <li>
                      <a href="/" className="text-blue-600 hover:underline">Documentation</a>
                    </li>
                    <li>
                      <a href="/" className="text-blue-600 hover:underline">Learn about WordPress Detection</a>
                    </li>
                  </ul> */}
                </div>
              </div>
              
              <div className="md:w-1/2">
                <Image 
                  src="42535.jpg" 
                  alt="WordPress Detection Illustration" 
                  className="w-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' fill='%23f3f4f6'%3E%3Crect width='300' height='200' rx='10'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' fill='%236b7280'%3EWordPress Detection%3E%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-medium mb-4">Terms of Service</h3>
                <p className="text-sm text-gray-600 mb-2">
                  By using WordPress Detector, you agree to these terms. We provide this service as is, without warranties.
                </p>
                <p className="text-sm text-gray-600">
                  We reserve the right to modify or terminate the service for any reason, without notice at any time.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Privacy Policy</h3>
                <p className="text-sm text-gray-600 mb-2">
                  We collect minimal data necessary to provide our service. This includes the URLs you submit for WordPress detection.
                </p>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your experience. You can opt out of non-essential cookies at any time.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Data Usage</h3>
                <p className="text-sm text-gray-600 mb-2">
                  We do not sell your personal data to third parties. We may use anonymized data for improving our service.
                </p>
                <p className="text-sm text-gray-600">
                  You can request deletion of your data by contacting us.
                </p>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {/* <div className="mb-4 md:mb-0">
                  <a href="/terms" className="text-gray-600 hover:text-gray-900 mr-4">Terms of Service</a>
                  <a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
                </div> */}
                
                <div className="flex space-x-6">
                  <a href="https://github.com/thsvo" className="text-gray-600 hover:text-gray-900">Github</a>
                  <a href="https://wa.me/+8801792577349" className="text-gray-600 hover:text-gray-900">WhatsApp</a>
                  <a href="https://codeopx.com/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
