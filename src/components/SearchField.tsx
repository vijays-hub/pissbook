"use client";

import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchField() {
  const router = useRouter();

  // This requires JS to be enabled in the browser.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();

    if (q) {
      // encodeURIComponent is used to encode special characters in the URL, meaning, escape them.
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    /**
     * On very very rare cases user might have JS disabled in the browser, or he might be on
     * a very slow network. In such cases, the form will be submitted to the server and the
     * redirect url would be different than what we expect. By default the form submits with the
     * query parameter in the URL, for ex: the URL would be: http://localhost:3000/?q=hello ;
     * instead of http://localhost:3000/search?q=hello. This is why we have to tell the form
     * to behave properly even when JS is disabled. This can be done by using the action attribute.
     * The action attribute specifies where to send the form-data when a form is submitted.
     * By default the method is GET, which means the form data is appended to the URL in the
     * action attribute. This is why we have to set the action attribute to /search.
     *
     * This process where we cater for a functionality when JS is disabled is called as
     * Progressive Enhancement. It is a strategy for web design that emphasizes core webpage
     * content first.
     * ! READ: https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement
     */
    <form onSubmit={handleSubmit} action={"/search"} className="md:flex-1">
      <div className="relative">
        <Input name="q" placeholder="Search" className="pe-10" />
        <SearchIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 size-5 text-muted-foreground" />
      </div>
    </form>
  );
}
