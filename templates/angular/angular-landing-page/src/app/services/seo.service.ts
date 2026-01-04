import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);

  private defaultConfig: SeoConfig = {
    title: 'My Landing Page',
    description: 'Build amazing web applications with our platform',
    keywords: 'web development, angular, typescript',
    type: 'website',
  };

  init() {
    // Update on route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setDefaultMeta();
      });
  }

  updateMeta(config: Partial<SeoConfig>) {
    const fullConfig = { ...this.defaultConfig, ...config };

    // Title
    this.title.setTitle(fullConfig.title);

    // Meta tags
    this.meta.updateTag({ name: 'description', content: fullConfig.description });
    
    if (fullConfig.keywords) {
      this.meta.updateTag({ name: 'keywords', content: fullConfig.keywords });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullConfig.title });
    this.meta.updateTag({ property: 'og:description', content: fullConfig.description });
    this.meta.updateTag({ property: 'og:type', content: fullConfig.type || 'website' });
    
    if (fullConfig.image) {
      this.meta.updateTag({ property: 'og:image', content: fullConfig.image });
    }
    
    if (fullConfig.url) {
      this.meta.updateTag({ property: 'og:url', content: fullConfig.url });
      this.meta.updateTag({ rel: 'canonical', href: fullConfig.url });
    }

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullConfig.title });
    this.meta.updateTag({ name: 'twitter:description', content: fullConfig.description });
    
    if (fullConfig.image) {
      this.meta.updateTag({ name: 'twitter:image', content: fullConfig.image });
    }
  }

  setDefaultMeta() {
    this.updateMeta(this.defaultConfig);
  }
}
