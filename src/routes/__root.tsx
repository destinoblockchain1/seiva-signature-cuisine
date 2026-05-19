import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="editorial-display text-7xl text-foreground">404</h1>
        <p className="eyebrow mt-6 text-muted-foreground">Page not found</p>
        <div className="mt-8">
          <Link to="/" className="eyebrow border-b border-foreground pb-1 text-foreground">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="editorial-display text-3xl">Something went wrong</h1>
        <p className="mt-4 text-sm text-muted-foreground">Please try again.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="eyebrow mt-8 border-b border-foreground pb-1"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SEIVA -  Signature cuisine, Tailor-Made" },
      { name: "description", content: "An international collective of three chefs. Private dinners, luxury brand activations and exclusive celebrations across Brazil, Italy and the United States." },
      { name: "author", content: "SEIVA" },
      { property: "og:title", content: "SEIVA -  Signature cuisine, Tailor-Made" },
      { property: "og:description", content: "An international collective of three chefs. Private dinners, luxury brand activations and exclusive celebrations across Brazil, Italy and the United States." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SEIVA -  Signature cuisine, Tailor-Made" },
      { name: "twitter:description", content: "An international collective of three chefs. Private dinners, luxury brand activations and exclusive celebrations across Brazil, Italy and the United States." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/nqugpZNOCEPtS4xBWBJmUCDgkhz1/social-images/social-1779162351387-Gemini_Generated_Image_h1lxh1lxh1lxh1lx.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/nqugpZNOCEPtS4xBWBJmUCDgkhz1/social-images/social-1779162351387-Gemini_Generated_Image_h1lxh1lxh1lxh1lx.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
