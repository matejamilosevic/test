import { test } from "node:test";
import assert from "node:assert";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LoyaltyStripView,
  UserProfileBanner,
  UserProfileBannerView,
} from "../ProfileBanner";

test("ProfileBanner exports use camelCase names", () => {
  assert.equal(typeof UserProfileBanner, "function");
  assert.notEqual(typeof (UserProfileBanner as { user_profile_banner?: unknown }).user_profile_banner, "function");
});

test("UserProfileBannerView renders profile name when data is available", () => {
  const html = renderToStaticMarkup(
    <UserProfileBannerView
      title="Profile"
      profile={{
        data: { id: "user-01", name: "Ada Lovelace" },
        loading: false,
        error: null,
      }}
    />,
  );

  assert.match(html, /Ada Lovelace/);
  assert.match(html, /Profile/);
});

test("UserProfileBannerView shows error state when profile load fails", () => {
  const html = renderToStaticMarkup(
    <UserProfileBannerView
      title="Profile"
      profile={{
        data: null,
        loading: false,
        error: "Unable to load profile",
      }}
    />,
  );

  assert.match(html, /Unable to load profile/);
});

test("UserProfileBannerView shows loading indicator while fetching", () => {
  const html = renderToStaticMarkup(
    <UserProfileBannerView
      title="Profile"
      profile={{
        data: null,
        loading: true,
        error: null,
      }}
    />,
  );

  assert.match(html, /Loading\.\.\./);
});

test("UserProfileBannerView handles empty profile data without crashing", () => {
  const html = renderToStaticMarkup(
    <UserProfileBannerView
      title="Profile"
      profile={{
        data: {},
        loading: false,
        error: null,
      }}
    />,
  );

  assert.match(html, /Profile/);
  assert.doesNotMatch(html, /Unable to load profile/);
});

test("LoyaltyStripView renders points from loyalty state", () => {
  const html = renderToStaticMarkup(
    <LoyaltyStripView
      label="Points"
      loyalty={{
        data: { points: 120 },
        points: 120,
        loading: false,
        error: null,
      }}
    />,
  );

  assert.match(html, /120/);
  assert.match(html, /Points/);
});
