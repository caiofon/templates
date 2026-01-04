import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div class="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 
          class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in"
          [class.opacity-100]="visible()"
        >
          Build Something
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Amazing
          </span>
        </h1>

        <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-delay">
          Create stunning web applications with our modern development platform.
          Fast, reliable, and scalable.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#get-started"
            class="px-8 py-4 bg-white text-primary-900 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Get Started Free
          </a>
          <a
            href="#demo"
            class="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
          >
            Watch Demo
          </a>
        </div>

        <!-- Stats -->
        <div class="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          @for (stat of stats; track stat.label) {
            <div class="text-center">
              <div class="text-4xl font-bold text-cyan-400">{{ stat.value }}</div>
              <div class="text-gray-400">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out;
    }
    .animate-fade-in-delay {
      animation: fadeIn 0.8s ease-out 0.2s both;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class HeroComponent {
  visible = signal(true);

  stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ];
}
