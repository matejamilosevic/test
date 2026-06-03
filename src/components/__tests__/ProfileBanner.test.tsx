import { test } from "node:test";
import assert from "node:assert";
import { JSDOM } from "jsdom";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LoyaltyStripView,
  UserProfileBanner,
  UserProfileBannerView,
} from "../ProfileBanner";
import {
  resetProfileConfigForTests,
  setProfileConfigForTests,
} from "../../lib/profile_config";

function setupDom(): HTMLElement {
  const dom = new JSDOM("<!DOCTYPE html><html><body><div id=\"root\"></div></body></html>");
  const { window } = dom;
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  globalThis.navigator = window.navigator;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Node = window.Node;
  return window.document.getElementById("root")!;
}

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

test("UserProfileBannerView shows Try again button when retry UX is enabled", () => {
  setProfileConfigForTests({ profileRetryUxEnabled: true });

  try {
    const html = renderToStaticMarkup(
      <UserProfileBannerView
        title="Profile"
        profile={{
          data: null,
          loading: false,
          error: "Unable to load profile",
          refetch: () => {},
        }}
      />,
    );

    assert.match(html, /Try again/);
  } finally {
    resetProfileConfigForTests();
  }
});

test("UserProfileBannerView hides Try again button when retry UX is disabled", () => {
  setProfileConfigForTests({ profileRetryUxEnabled: false });

  try {
    const html = renderToStaticMarkup(
      <UserProfileBannerView
        title="Profile"
        profile={{
          data: null,
          loading: false,
          error: "Unable to load profile",
          refetch: () => {},
        }}
      />,
    );

    assert.match(html, /Unable to load profile/);
    assert.doesNotMatch(html, /Try again/);
  } finally {
    resetProfileConfigForTests();
  }
});

test("LoyaltyStripView shows Try again button when retry UX is enabled", () => {
  setProfileConfigForTests({ profileRetryUxEnabled: true });

  try {
    const html = renderToStaticMarkup(
      <LoyaltyStripView
        label="Points"
        loyalty={{
          data: null,
          points: null,
          loading: false,
          error: "Unable to load loyalty points",
          refetch: () => {},
        }}
      />,
    );

    assert.match(html, /Try again/);
  } finally {
    resetProfileConfigForTests();
  }
});

test("UserProfileBannerView Try again click calls refetch once", async () => {
  setProfileConfigForTests({ profileRetryUxEnabled: true });
  let refetchCalls = 0;
  const refetch = () => {
    refetchCalls += 1;
  };

  const container = setupDom();
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(
        <UserProfileBannerView
          title="Profile"
          profile={{
            data: null,
            loading: false,
            error: "Unable to load profile",
            refetch,
          }}
        />,
      );
    });

    const button = container.querySelector("button");
    assert.ok(button);
    assert.match(button?.textContent ?? "", /Try again/);

    await act(async () => {
      button!.click();
    });

    assert.equal(refetchCalls, 1);
  } finally {
    root.unmount();
    resetProfileConfigForTests();
  }
});

test("LoyaltyStripView Try again click calls refetch once", async () => {
  setProfileConfigForTests({ profileRetryUxEnabled: true });
  let refetchCalls = 0;
  const refetch = () => {
    refetchCalls += 1;
  };

  const container = setupDom();
  const root = createRoot(container);

  try {
    await act(async () => {
      root.render(
        <LoyaltyStripView
          label="Points"
          loyalty={{
            data: null,
            points: null,
            loading: false,
            error: "Unable to load loyalty points",
            refetch,
          }}
        />,
      );
    });

    const button = container.querySelector("button");
    assert.ok(button);

    await act(async () => {
      button!.click();
    });

    assert.equal(refetchCalls, 1);
  } finally {
    root.unmount();
    resetProfileConfigForTests();
  }
});
