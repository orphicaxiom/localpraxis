---
title: Texas HOT tax, split right
date: 2026-04-22
slug: texas-hot-tax-owner-portal
description: Port Aransas STR owners owe two different occupancy taxes to two different agencies, collected two different ways. Here is what custom software that understands that looks like.
tags: [case-study, str, port-aransas, texas]
---

If you own a short-term rental in Port Aransas, your occupancy taxes are split two ways. Six percent goes to the State of Texas. Nine percent goes to the City of Port Aransas. Fifteen percent total on the taxable subtotal, which is nightly revenue plus cleaning fee.

That is not the complicated part.

The complicated part is that those two halves are collected differently. The state six percent is collected for you automatically if the booking comes through Airbnb or VRBO. The city nine percent is not. The owner, or the property manager if you use one, has to remit the nine percent directly to the City of Port Aransas, monthly, through a system called MuniRevs.

If you do not split those two numbers cleanly at the time of the booking, you either overpay the state, underpay the city, or spend an afternoon every month with a spreadsheet trying to figure out which is which. Most owners I talk to have done some version of that at least once.

The booking system most STR owners use was not built with this in mind. It was built to serve every vacation rental in America, and America's occupancy tax landscape is a patchwork of state, county, and city rates that change every year. The platform does an average job of collecting. It does not do a good job of telling you what you actually owe to whom.

An owner portal that does understand this is a different piece of software. I want to show you what the inside of one looks like.

## The shape of the calculation

Here is the actual function from the [owner portal demo](/demos/portal.html) on this site. It is about twenty lines of code.

```js
function computeFinancials(reservation, property, channel) {
  const nights            = daysBetween(reservation.check_in, reservation.check_out);
  const nightly_revenue   = nights * property.nightly_rate;
  const cleaning_fee      = property.cleaning_fee;
  const taxable_subtotal  = nightly_revenue + cleaning_fee;

  const state_hot         = taxable_subtotal * 0.06;   // collected by Airbnb/VRBO
  const city_hot          = taxable_subtotal * 0.09;   // remitted via MuniRevs
  const taxes             = state_hot + city_hot;
  const guest_total       = taxable_subtotal + taxes;

  const channel_fee       = taxable_subtotal * channel.fee_pct;
  const gross_after_channel  = guest_total - channel_fee - taxes;
  const cleaning_passthrough = cleaning_fee;
  const rental_revenue       = gross_after_channel - cleaning_passthrough;
  const mgmt_fee             = rental_revenue * property.mgmt_fee_pct;
  const owner_payout         = rental_revenue - mgmt_fee;

  return { nights, state_hot, city_hot, taxes, guest_total, channel_fee, owner_payout };
}
```

There is nothing clever in that function. That is the point. A booking platform produces one big "taxes and fees" line on the guest checkout. An owner who actually has to file HOT needs the state and city pieces separated at the time the booking is created, not reconstructed later from a monthly export.

A few specific choices worth calling out.

**State and city are stored as separate values.** Not computed on the fly from a single fifteen-percent total. When the city changes its rate, which happens, one of these two numbers changes and the other does not. A portal that stores them as distinct values is one update away from correct. A portal that stores a single blended rate has to untangle historical data to figure out what was paid to whom.

**The channel fee is calculated on the taxable subtotal, not the guest total.** Airbnb and VRBO charge their host service fee on nightly plus cleaning, not on the final amount that includes tax. If your owner statement charges the channel fee on the post-tax total, it is wrong, and you are overestimating your deductions.

**The cleaning fee passes through.** The cleaner gets paid. It is not owner revenue, but it is taxable. Several spreadsheet systems I have seen either forget to tax the cleaning fee or accidentally count it twice in the owner payout.

**The management fee is calculated on rental revenue, not on gross.** That is the post-channel-fee, post-tax, post-cleaning amount. A property manager taking twenty percent of gross and a property manager taking twenty percent of rental revenue are offering two very different deals. The statement has to be explicit about which one it is.

## What this looks like in the portal

When an owner opens the demo portal, every reservation is displayed with each of those numbers broken out. The total the guest paid. The channel fee. The state HOT. The city HOT. The management fee. The owner's actual payout. A running total at the top of the month.

At the end of the month, the portal produces a HOT report. Two numbers. State HOT to verify was collected. City HOT to remit via MuniRevs, with the amount ready to copy into the filing.

That is a tool that ends the spreadsheet afternoon. It takes a month of reservations and produces the two numbers that match the two filings you actually have to make.

## Why this matters

Three reasons.

First, because it is a compliance tool, not just a reporting tool. Getting HOT wrong is the kind of mistake that shows up during a property sale or a routine audit. A clean monthly record is worth more than what it costs to build.

Second, because the domain logic changes. Rates change. Airbnb's collection behavior changes. The MuniRevs portal changes. With software you own, those changes are a pull request. With software you rent, those changes are feature requests that will never happen, because you are not the customer they are building for.

Third, because a booking calendar is a commodity and a tax-aware owner statement is not. Anyone can build a booking calendar. Knowing that Texas splits HOT between the state and the city, that Airbnb collects one piece and the owner remits the other through MuniRevs, and that the channel fee is calculated on the subtotal and not the guest total. That is the job. That knowledge is what separates a developer building software for Port Aransas from a developer building software for everyone.

## See it running

The [owner portal demo](/demos/portal.html) is live on this site with the logic above. Open any reservation. The state and city HOT are separated. At the end of the month, the report generator produces the two numbers you need for your filings.

If you own an STR in Port Aransas and this is accounting your current platform is not doing for you, that gap is a real cost. The math on what you are paying is on the [home page calculator](/#calculator). The code is here.
