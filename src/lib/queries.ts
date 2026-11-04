import { queryOptions } from "@tanstack/react-query";
import {
  getAddons,
  getBlogPostBySlug,
  getBlogPosts,
  getFaqs,
  getPortfolio,
  getPortfolioBySlug,
  getProcessSteps,
  getServiceBySlug,
  getServices,
  getSiteData,
  getTeam,
} from "./public.functions";

const stale = 60_000;

export const siteQuery = queryOptions({ queryKey: ["site"], queryFn: () => getSiteData(), staleTime: stale });
export const servicesQuery = queryOptions({ queryKey: ["services"], queryFn: () => getServices(), staleTime: stale });
export const addonsQuery = queryOptions({ queryKey: ["addons"], queryFn: () => getAddons(), staleTime: stale });
export const serviceQuery = (slug: string) =>
  queryOptions({ queryKey: ["service", slug], queryFn: () => getServiceBySlug({ data: { slug } }), staleTime: stale });
export const portfolioQuery = queryOptions({ queryKey: ["portfolio"], queryFn: () => getPortfolio(), staleTime: stale });
export const portfolioItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["portfolio", slug],
    queryFn: () => getPortfolioBySlug({ data: { slug } }),
    staleTime: stale,
  });
export const processQuery = queryOptions({ queryKey: ["process"], queryFn: () => getProcessSteps(), staleTime: stale });
export const faqQuery = queryOptions({ queryKey: ["faqs"], queryFn: () => getFaqs(), staleTime: stale });
export const teamQuery = queryOptions({ queryKey: ["team"], queryFn: () => getTeam(), staleTime: stale });
export const blogQuery = queryOptions({ queryKey: ["blog"], queryFn: () => getBlogPosts(), staleTime: stale });
export const blogPostQuery = (slug: string) =>
  queryOptions({ queryKey: ["blog", slug], queryFn: () => getBlogPostBySlug({ data: { slug } }), staleTime: stale });
