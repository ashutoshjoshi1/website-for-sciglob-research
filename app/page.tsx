'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import Logo from './components/Logo';
import Navigation from './components/Navigation';

interface Location {
  Location: string;
  Latitude: number;
  Longitude: number;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, mounted]);

  useEffect(() => {
    // Load CSV data
    d3.csv('/pandora_list.csv').then((data) => {
      const parsedData = data.map((d: any) => ({
        Location: d.Location,
        Latitude: +d.Latitude,
        Longitude: +d.Longitude
      }));
      setLocations(parsedData);
    });
  }, []);

  useEffect(() => {
    if (!mounted || locations.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Clear previous map
    d3.select('#world-map').selectAll('*').remove();

    const svg = d3.select('#world-map')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'fixed')
      .style('top', 0)
      .style('left', 0);

    const projection = d3.geoMercator()
      .scale((width - 3) / (2 * Math.PI))
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Draw world map
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((data: any) => {
        const countries = topojson.feature(data, data.objects.countries);
        
        svg.append('g')
          .selectAll('path')
          .data((countries as any).features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', isDarkMode ? '#2d2d2d' : '#f3f4f6')
          .attr('stroke', isDarkMode ? '#3d3d3d' : '#e5e7eb')
          .attr('stroke-width', 0.5);

        // Add pins
        const pinGroup = svg.append('g')
          .attr('class', 'pins');

        const animatePulse = (element: d3.Selection<SVGCircleElement, unknown, null, undefined>) => {
          element
            .attr('r', 4)
            .style('opacity', 0.3)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('r', 12)
            .style('opacity', 0)
            .on('end', () => animatePulse(element));
        };

        locations.forEach((location, index) => {
          const [x, y] = projection([location.Longitude, location.Latitude]) || [0, 0];
          
          const pin = pinGroup.append('g')
            .attr('transform', `translate(${x},${y})`)
            .attr('class', 'pin')
            .style('cursor', 'pointer');

          // Add main pin circle with bounce animation
          const mainCircle = pin.append('circle')
            .attr('r', 6)
            .attr('fill', isDarkMode ? '#3B82F6' : '#10B981')
            .style('opacity', 0.8);

          // Add glow effect
          const glow = pin.append('circle')
            .attr('r', 6)
            .attr('fill', isDarkMode ? '#3B82F6' : '#10B981')
            .style('opacity', 0.2)
            .style('filter', 'blur(2px)');

          // Add pulsing animation
          const pulseCircle = pin.append('circle')
            .attr('r', 6)
            .attr('fill', 'none')
            .attr('stroke', isDarkMode ? '#3B82F6' : '#10B981')
            .attr('stroke-width', 2)
            .style('opacity', 0);

          // Create tooltip
          const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background-color', isDarkMode ? '#2d2d2d' : '#ffffff')
            .style('color', isDarkMode ? '#ffffff' : '#1a1a1a')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '14px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')
            .style('z-index', '1000');

          // Add hover effects
          pin.on('mouseover', function(event) {
            d3.select(this).select('circle')
              .transition()
              .duration(200)
              .attr('r', 8)
              .style('opacity', 1);

            tooltip
              .style('visibility', 'visible')
              .text(location.Location)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mousemove', function(event) {
            tooltip
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this).select('circle')
              .transition()
              .duration(200)
              .attr('r', 6)
              .style('opacity', 0.8);

            tooltip.style('visibility', 'hidden');
          });

          // Start animations
          animatePulse(pulseCircle);

          // Add bounce animation to main circle
          const bounce = () => {
            mainCircle
              .transition()
              .duration(1000)
              .ease(d3.easeElastic)
              .attr('r', 8)
              .transition()
              .duration(1000)
              .ease(d3.easeElastic)
              .attr('r', 6)
              .on('end', bounce);
          };

          bounce();
        });
      });
  }, [mounted, isDarkMode, locations]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Map Layer */}
      <div id="world-map" className="fixed inset-0" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-dark-bg shadow-md z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <Navigation isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
          </div>
        </div>
      </header>

      {/* Centered Text */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-black dark:text-white">
            Better science for a<br />
            brighter future
          </h1>
        </motion.div>
      </div>

      {/* Scroll Down Arrow */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <svg
            className="w-8 h-8 text-black dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
} 