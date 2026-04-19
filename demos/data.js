// =============================================================================
// LOCAL PRAXIS — OWNER PORTAL DEMO SEED DATA
// Single source of truth. All three views (owner, manager, guest) read from here.
// =============================================================================

const DEMO_TODAY = "2026-04-19";

function daysBetween(a, b) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b) - new Date(a)) / msPerDay);
}

// Texas HOT breakdown (Port Aransas, effective Jan 1 2026):
//   state_hot  = taxable_subtotal × 0.06  — collected by Airbnb/VRBO automatically
//   city_hot   = taxable_subtotal × 0.09  — owner remits directly via MuniRevs
//   total taxes = 0.15 of taxable_subtotal (nightly + cleaning, per TX law)
// Both values are returned so the owner statement can display them as separate line items.
//
// Channel fee basis: charged on taxable_subtotal (nightly + cleaning), NOT on
// guest_total. Matches Airbnb/VRBO/Booking.com policy — host service fees are
// calculated from the booking subtotal and exclude taxes.

function computeFinancials(reservation, property, channel) {
  const nights = daysBetween(reservation.check_in, reservation.check_out);

  const nightly_revenue    = nights * property.nightly_rate;
  const cleaning_fee       = property.cleaning_fee;
  const taxable_subtotal   = nightly_revenue + cleaning_fee;
  const state_hot          = taxable_subtotal * 0.06;
  const city_hot           = taxable_subtotal * 0.09;
  const taxes              = state_hot + city_hot;           // = taxable_subtotal × 0.15
  const guest_total        = taxable_subtotal + taxes;

  const channel_fee        = taxable_subtotal * channel.fee_pct;

  const gross_after_channel  = guest_total - channel_fee - taxes;
  const cleaning_passthrough = cleaning_fee;
  const rental_revenue       = gross_after_channel - cleaning_passthrough;
  const mgmt_fee             = rental_revenue * property.mgmt_fee_pct;
  const owner_payout         = rental_revenue - mgmt_fee;

  return {
    nights,
    nightly_revenue,
    cleaning_fee,
    state_hot,
    city_hot,
    taxes,
    guest_total,
    channel_fee,
    cleaning_passthrough,
    mgmt_fee,
    owner_payout,
  };
}

// =============================================================================
// CHANNELS
// =============================================================================

const CHANNELS = [
  { id: "ch1", name: "Airbnb",      fee_pct: 0.03  },
  { id: "ch2", name: "VRBO",        fee_pct: 0.08  },
  { id: "ch3", name: "Booking.com", fee_pct: 0.15  },
  { id: "ch4", name: "Direct",      fee_pct: 0.029 },
];

// =============================================================================
// VENDORS
// =============================================================================

const VENDORS = [
  { id: "v1", name: "Island Clean Co.",     type: "cleaning",    phone: "361-555-0142", email: "dispatch@islandclean.com"   },
  { id: "v2", name: "Coastal Maintenance",  type: "maintenance", phone: "361-555-0198", email: "work@coastalmaint.com"       },
  { id: "v3", name: "Bay Area Cleaning",    type: "cleaning",    phone: "361-555-0231", email: "bay@bayareaclean.com"        },
  { id: "v4", name: "Port A Handyman LLC",  type: "maintenance", phone: "361-555-0317", email: "portahandyman@gmail.com"    },
];

// =============================================================================
// OWNERS (16)
// =============================================================================

const OWNERS = [
  { id: "o1",  name: "Sarah Whitaker",    email: "sarah.whitaker@gmail.com",     phone: "512-555-0101" },
  { id: "o2",  name: "Marcus Chen",       email: "mchen.realty@outlook.com",     phone: "713-555-0184" },
  { id: "o3",  name: "Diane Kowalski",    email: "dkowalski@me.com",             phone: "210-555-0227" },
  { id: "o4",  name: "Robert Tran",       email: "rtran.invest@gmail.com",       phone: "832-555-0063" },
  { id: "o5",  name: "Linda Okafor",      email: "linda.okafor@icloud.com",      phone: "214-555-0312" },
  { id: "o6",  name: "James Harrington",  email: "jharrington55@gmail.com",      phone: "512-555-0449" },
  { id: "o7",  name: "Patricia Nguyen",   email: "pnguyen.property@gmail.com",   phone: "281-555-0501" },
  { id: "o8",  name: "David Ruiz",        email: "davidruiz.tx@outlook.com",     phone: "361-555-0077" },
  { id: "o9",  name: "Karen Stevenson",   email: "kstevenson.rental@gmail.com",  phone: "512-555-0638" },
  { id: "o10", name: "Thomas Belfort",    email: "tbelfort@protonmail.com",      phone: "713-555-0744" },
  { id: "o11", name: "Angela Morales",    email: "angelam.props@gmail.com",      phone: "210-555-0819" },
  { id: "o12", name: "Greg Sutton",       email: "gregsutton@me.com",            phone: "512-555-0902" },
  { id: "o13", name: "Michelle Park",     email: "mpark.strs@gmail.com",         phone: "832-555-0155" },
  { id: "o14", name: "Frank Delacroix",   email: "fdelacroix.tx@outlook.com",    phone: "214-555-0288" },
  { id: "o15", name: "Joyce Andersen",    email: "joyceandersen@icloud.com",     phone: "512-555-0374" },
  { id: "o16", name: "Carl Washington",   email: "carlwash.invest@gmail.com",    phone: "713-555-0461" },
];

// =============================================================================
// GUESTS (40)
// =============================================================================

const GUESTS = [
  { id: "g1",  name: "Allison Carter",    email: "allison.carter@gmail.com",      phone: "512-555-1001" },
  { id: "g2",  name: "Ben Hooper",        email: "ben.hooper@outlook.com",        phone: "713-555-1042" },
  { id: "g3",  name: "Carmen Reyes",      email: "carmen.reyes@icloud.com",       phone: "210-555-1083" },
  { id: "g4",  name: "Derek Schmidt",     email: "derek.schmidt@gmail.com",       phone: "832-555-1124" },
  { id: "g5",  name: "Elena Vasquez",     email: "evasquez@me.com",               phone: "214-555-1165" },
  { id: "g6",  name: "Frank Obi",         email: "frank.obi@outlook.com",         phone: "512-555-1206" },
  { id: "g7",  name: "Grace Kim",         email: "grace.kim@gmail.com",           phone: "281-555-1247" },
  { id: "g8",  name: "Harold Patel",      email: "hpatel.travel@gmail.com",       phone: "361-555-1288" },
  { id: "g9",  name: "Irene Thornton",    email: "irene.thornton@icloud.com",     phone: "512-555-1329" },
  { id: "g10", name: "Jack Moreau",       email: "jack.moreau@gmail.com",         phone: "713-555-1370" },
  { id: "g11", name: "Kayla Simmons",     email: "kayla.simmons@outlook.com",     phone: "210-555-1411" },
  { id: "g12", name: "Liam Torres",       email: "liam.torres@gmail.com",         phone: "832-555-1452" },
  { id: "g13", name: "Monica Bell",       email: "monica.bell@me.com",            phone: "214-555-1493" },
  { id: "g14", name: "Nathan Cruz",       email: "ncruz.vacay@gmail.com",         phone: "512-555-1534" },
  { id: "g15", name: "Olivia Grant",      email: "olivia.grant@icloud.com",       phone: "713-555-1575" },
  { id: "g16", name: "Paul Nakamura",     email: "paul.nakamura@outlook.com",     phone: "210-555-1616" },
  { id: "g17", name: "Rachel Soto",       email: "rachel.soto@gmail.com",         phone: "512-555-1657" },
  { id: "g18", name: "Samuel Adeyemi",    email: "s.adeyemi@gmail.com",           phone: "281-555-1698" },
  { id: "g19", name: "Tara Holloway",     email: "tara.holloway@me.com",          phone: "832-555-1739" },
  { id: "g20", name: "Ulric Jensen",      email: "ulric.jensen@outlook.com",      phone: "214-555-1780" },
  { id: "g21", name: "Veronica Marsh",    email: "vmarsh.travels@gmail.com",      phone: "512-555-1821" },
  { id: "g22", name: "Wayne Liu",         email: "wayne.liu@gmail.com",           phone: "713-555-1862" },
  { id: "g23", name: "Xena Fontaine",     email: "xena.fontaine@icloud.com",      phone: "210-555-1903" },
  { id: "g24", name: "Yusuf Okonkwo",     email: "yusuf.okonkwo@outlook.com",     phone: "832-555-1944" },
  { id: "g25", name: "Zoe Caldwell",      email: "zoe.caldwell@gmail.com",        phone: "214-555-1985" },
  { id: "g26", name: "Aaron Briggs",      email: "aaron.briggs@gmail.com",        phone: "512-555-2026" },
  { id: "g27", name: "Brittany Cole",     email: "brittany.cole@me.com",          phone: "713-555-2067" },
  { id: "g28", name: "Carlos Espinoza",   email: "c.espinoza@outlook.com",        phone: "210-555-2108" },
  { id: "g29", name: "Dana Hutchins",     email: "dana.hutchins@gmail.com",       phone: "281-555-2149" },
  { id: "g30", name: "Evan Moss",         email: "evan.moss@icloud.com",          phone: "832-555-2190" },
  { id: "g31", name: "Fiona Walsh",       email: "fiona.walsh@gmail.com",         phone: "214-555-2231" },
  { id: "g32", name: "Gary Leblanc",      email: "gary.leblanc@outlook.com",      phone: "512-555-2272" },
  { id: "g33", name: "Hannah Pittman",    email: "hannah.pittman@gmail.com",      phone: "713-555-2313" },
  { id: "g34", name: "Ian Drummond",      email: "ian.drummond@me.com",           phone: "210-555-2354" },
  { id: "g35", name: "Julia Ferreira",    email: "julia.ferreira@gmail.com",      phone: "832-555-2395" },
  { id: "g36", name: "Kevin Ashworth",    email: "k.ashworth@outlook.com",        phone: "214-555-2436" },
  { id: "g37", name: "Laura Mendez",      email: "laura.mendez@icloud.com",       phone: "512-555-2477" },
  { id: "g38", name: "Mike Gallagher",    email: "mike.gallagher@gmail.com",      phone: "713-555-2518" },
  { id: "g39", name: "Nancy Owens",       email: "nancy.owens@outlook.com",       phone: "210-555-2559" },
  { id: "g40", name: "Oscar Tran",        email: "oscar.tran@gmail.com",          phone: "832-555-2600" },
  // Added during Q1 volume expansion:
  { id: "g41", name: "Allen Ramos",       email: "allen.ramos@gmail.com",         phone: "512-555-2641" },
  { id: "g42", name: "Bethany Quinn",     email: "bethany.quinn@outlook.com",     phone: "713-555-2682" },
  { id: "g43", name: "Christopher Yoo",   email: "chris.yoo@gmail.com",           phone: "210-555-2723" },
  { id: "g44", name: "Diana Whitfield",   email: "d.whitfield@icloud.com",        phone: "832-555-2764" },
  { id: "g45", name: "Eric Paulsen",      email: "eric.paulsen@me.com",           phone: "214-555-2805" },
  { id: "g46", name: "Francesca Milano",  email: "f.milano@gmail.com",            phone: "512-555-2846" },
  { id: "g47", name: "Gabriel Acosta",    email: "gabe.acosta@outlook.com",       phone: "281-555-2887" },
  { id: "g48", name: "Heather McIntyre",  email: "heather.mcintyre@gmail.com",    phone: "361-555-2928" },
  { id: "g49", name: "Isaac Bello",       email: "isaac.bello@icloud.com",        phone: "512-555-2969" },
  { id: "g50", name: "Jenna Castillo",    email: "jenna.castillo@gmail.com",      phone: "713-555-3010" },
  { id: "g51", name: "Khalil Wright",     email: "khalil.wright@outlook.com",     phone: "210-555-3051" },
  { id: "g52", name: "Lucia Barrera",     email: "lucia.barrera@gmail.com",       phone: "832-555-3092" },
];

// =============================================================================
// CHANNEL LISTINGS (bridge: Property × Channel)
// Each property listed on Airbnb, VRBO, and Direct. Booking.com on ~half.
// =============================================================================

const CHANNEL_LISTINGS = [
  // p1 — Sandcastle 412
  { id: "cl1",  property_id: "p1",  channel_id: "ch1", listing_id: "ABB-8821041", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl2",  property_id: "p1",  channel_id: "ch2", listing_id: "VRB-3310824", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl3",  property_id: "p1",  channel_id: "ch4", listing_id: "DIR-p1",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p2 — Mustang Towers 7B
  { id: "cl4",  property_id: "p2",  channel_id: "ch1", listing_id: "ABB-9934712", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl5",  property_id: "p2",  channel_id: "ch2", listing_id: "VRB-4421903", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl6",  property_id: "p2",  channel_id: "ch3", listing_id: "BDC-2201448", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl7",  property_id: "p2",  channel_id: "ch4", listing_id: "DIR-p2",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p3 — Sea Breeze Cottage
  { id: "cl8",  property_id: "p3",  channel_id: "ch1", listing_id: "ABB-7743210", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl9",  property_id: "p3",  channel_id: "ch2", listing_id: "VRB-5512087", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl10", property_id: "p3",  channel_id: "ch4", listing_id: "DIR-p3",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p4 — Gulf View 201
  { id: "cl11", property_id: "p4",  channel_id: "ch1", listing_id: "ABB-6654389", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl12", property_id: "p4",  channel_id: "ch4", listing_id: "DIR-p4",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p5 — Pelican Perch
  { id: "cl13", property_id: "p5",  channel_id: "ch1", listing_id: "ABB-8819023", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl14", property_id: "p5",  channel_id: "ch2", listing_id: "VRB-6623114", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl15", property_id: "p5",  channel_id: "ch3", listing_id: "BDC-3312501", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl16", property_id: "p5",  channel_id: "ch4", listing_id: "DIR-p5",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p6 — Tarpon Flats
  { id: "cl17", property_id: "p6",  channel_id: "ch1", listing_id: "ABB-7730912", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl18", property_id: "p6",  channel_id: "ch2", listing_id: "VRB-7734205", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl19", property_id: "p6",  channel_id: "ch4", listing_id: "DIR-p6",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p7 — Driftwood House
  { id: "cl20", property_id: "p7",  channel_id: "ch1", listing_id: "ABB-5541803", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl21", property_id: "p7",  channel_id: "ch2", listing_id: "VRB-8845316", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl22", property_id: "p7",  channel_id: "ch3", listing_id: "BDC-4423692", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl23", property_id: "p7",  channel_id: "ch4", listing_id: "DIR-p7",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p8 — Blue Heron Bungalow
  { id: "cl24", property_id: "p8",  channel_id: "ch1", listing_id: "ABB-4452694", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl25", property_id: "p8",  channel_id: "ch4", listing_id: "DIR-p8",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p9 — Port Royal 305
  { id: "cl26", property_id: "p9",  channel_id: "ch1", listing_id: "ABB-3363485", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl27", property_id: "p9",  channel_id: "ch2", listing_id: "VRB-9956427", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl28", property_id: "p9",  channel_id: "ch4", listing_id: "DIR-p9",      sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p10 — Tide Pool House
  { id: "cl29", property_id: "p10", channel_id: "ch1", listing_id: "ABB-2274376", sync_status: "pending", last_synced_at: "2026-04-18T22:31:00" },
  { id: "cl30", property_id: "p10", channel_id: "ch2", listing_id: "VRB-1167538", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl31", property_id: "p10", channel_id: "ch3", listing_id: "BDC-5534783", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl32", property_id: "p10", channel_id: "ch4", listing_id: "DIR-p10",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p11 — Island Pines
  { id: "cl33", property_id: "p11", channel_id: "ch1", listing_id: "ABB-1185267", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl34", property_id: "p11", channel_id: "ch2", listing_id: "VRB-2278649", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl35", property_id: "p11", channel_id: "ch4", listing_id: "DIR-p11",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p12 — Sand Dollar Suite
  { id: "cl36", property_id: "p12", channel_id: "ch1", listing_id: "ABB-9096158", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl37", property_id: "p12", channel_id: "ch4", listing_id: "DIR-p12",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p13 — Marlin's Rest
  { id: "cl38", property_id: "p13", channel_id: "ch1", listing_id: "ABB-8007049", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl39", property_id: "p13", channel_id: "ch2", listing_id: "VRB-3389730", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl40", property_id: "p13", channel_id: "ch3", listing_id: "BDC-6645874", sync_status: "error",   last_synced_at: "2026-04-17T14:02:00" },
  { id: "cl41", property_id: "p13", channel_id: "ch4", listing_id: "DIR-p13",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p14 — Lighthouse Landing
  { id: "cl42", property_id: "p14", channel_id: "ch1", listing_id: "ABB-7018821", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl43", property_id: "p14", channel_id: "ch2", listing_id: "VRB-4400621", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl44", property_id: "p14", channel_id: "ch4", listing_id: "DIR-p14",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p15 — Bayside Retreat
  { id: "cl45", property_id: "p15", channel_id: "ch1", listing_id: "ABB-6129512", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl46", property_id: "p15", channel_id: "ch2", listing_id: "VRB-5511412", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl47", property_id: "p15", channel_id: "ch3", listing_id: "BDC-7756965", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl48", property_id: "p15", channel_id: "ch4", listing_id: "DIR-p15",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p16 — Salty Dog Cottage
  { id: "cl49", property_id: "p16", channel_id: "ch1", listing_id: "ABB-5230203", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl50", property_id: "p16", channel_id: "ch4", listing_id: "DIR-p16",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p17 — Osprey's Nest
  { id: "cl51", property_id: "p17", channel_id: "ch1", listing_id: "ABB-4340894", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl52", property_id: "p17", channel_id: "ch2", listing_id: "VRB-6622203", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl53", property_id: "p17", channel_id: "ch4", listing_id: "DIR-p17",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p18 — Breakwater 202
  { id: "cl54", property_id: "p18", channel_id: "ch1", listing_id: "ABB-3451585", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl55", property_id: "p18", channel_id: "ch2", listing_id: "VRB-7733994", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl56", property_id: "p18", channel_id: "ch4", listing_id: "DIR-p18",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p19 — Palmetto Place
  { id: "cl57", property_id: "p19", channel_id: "ch1", listing_id: "ABB-2562276", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl58", property_id: "p19", channel_id: "ch2", listing_id: "VRB-8844785", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl59", property_id: "p19", channel_id: "ch3", listing_id: "BDC-8867056", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl60", property_id: "p19", channel_id: "ch4", listing_id: "DIR-p19",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p20 — Surfside 8
  { id: "cl61", property_id: "p20", channel_id: "ch1", listing_id: "ABB-1673067", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl62", property_id: "p20", channel_id: "ch2", listing_id: "VRB-9955576", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl63", property_id: "p20", channel_id: "ch4", listing_id: "DIR-p20",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p21 — Shell Seeker
  { id: "cl64", property_id: "p21", channel_id: "ch1", listing_id: "ABB-0783758", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl65", property_id: "p21", channel_id: "ch4", listing_id: "DIR-p21",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p22 — Coastal Cove
  { id: "cl66", property_id: "p22", channel_id: "ch1", listing_id: "ABB-9894449", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl67", property_id: "p22", channel_id: "ch2", listing_id: "VRB-1066367", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl68", property_id: "p22", channel_id: "ch3", listing_id: "BDC-9978147", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl69", property_id: "p22", channel_id: "ch4", listing_id: "DIR-p22",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p23 — Sunrise Suite
  { id: "cl70", property_id: "p23", channel_id: "ch1", listing_id: "ABB-8905130", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl71", property_id: "p23", channel_id: "ch4", listing_id: "DIR-p23",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  // p24 — Deckhouse at Horace Caldwell
  { id: "cl72", property_id: "p24", channel_id: "ch1", listing_id: "ABB-7916821", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl73", property_id: "p24", channel_id: "ch2", listing_id: "VRB-2177158", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl74", property_id: "p24", channel_id: "ch3", listing_id: "BDC-0089238", sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
  { id: "cl75", property_id: "p24", channel_id: "ch4", listing_id: "DIR-p24",     sync_status: "synced",  last_synced_at: "2026-04-19T08:14:00" },
];

// =============================================================================
// RESERVATIONS (77)
// Minimal inputs only — financials computed at runtime via computeFinancials().
// Dates relative to DEMO_TODAY = "2026-04-19"
// Today's check-ins: r18 (p3), r35 (p7), r53 (p13)
// Today's check-out:  r48 (p11)
// =============================================================================

const RESERVATIONS = [
  // p1 — Sandcastle 412
  { id: "r1",  property_id: "p1",  guest_id: "g1",  channel_id: "ch1", check_in: "2026-01-10", check_out: "2026-01-14", status: "completed" },
  { id: "r2",  property_id: "p1",  guest_id: "g2",  channel_id: "ch2", check_in: "2026-01-24", check_out: "2026-01-28", status: "completed" },
  { id: "r3",  property_id: "p1",  guest_id: "g3",  channel_id: "ch4", check_in: "2026-02-14", check_out: "2026-02-18", status: "completed" },
  { id: "r4",  property_id: "p1",  guest_id: "g4",  channel_id: "ch1", check_in: "2026-03-08", check_out: "2026-03-12", status: "completed" },
  { id: "r5",  property_id: "p1",  guest_id: "g5",  channel_id: "ch2", check_in: "2026-04-11", check_out: "2026-04-15", status: "completed" },
  { id: "r6",  property_id: "p1",  guest_id: "g6",  channel_id: "ch1", check_in: "2026-04-22", check_out: "2026-04-27", status: "confirmed" },
  { id: "r7",  property_id: "p1",  guest_id: "g7",  channel_id: "ch4", check_in: "2026-05-10", check_out: "2026-05-17", status: "confirmed" },
  { id: "r8",  property_id: "p1",  guest_id: "g8",  channel_id: "ch2", check_in: "2026-06-06", check_out: "2026-06-13", status: "confirmed" },

  // p2 — Mustang Towers 7B
  { id: "r9",  property_id: "p2",  guest_id: "g9",  channel_id: "ch1", check_in: "2026-01-04", check_out: "2026-01-08", status: "completed" },
  { id: "r10", property_id: "p2",  guest_id: "g10", channel_id: "ch2", check_in: "2026-02-01", check_out: "2026-02-06", status: "completed" },
  { id: "r11", property_id: "p2",  guest_id: "g11", channel_id: "ch3", check_in: "2026-03-01", check_out: "2026-03-05", status: "completed" },
  { id: "r12", property_id: "p2",  guest_id: "g12", channel_id: "ch1", check_in: "2026-04-04", check_out: "2026-04-09", status: "completed" },
  { id: "r13", property_id: "p2",  guest_id: "g13", channel_id: "ch2", check_in: "2026-04-24", check_out: "2026-04-30", status: "confirmed" },
  { id: "r14", property_id: "p2",  guest_id: "g14", channel_id: "ch4", check_in: "2026-05-23", check_out: "2026-05-30", status: "confirmed" },

  // p3 — Sea Breeze Cottage
  { id: "r15", property_id: "p3",  guest_id: "g15", channel_id: "ch1", check_in: "2026-01-17", check_out: "2026-01-21", status: "completed" },
  { id: "r16", property_id: "p3",  guest_id: "g16", channel_id: "ch2", check_in: "2026-02-21", check_out: "2026-02-25", status: "completed" },
  { id: "r17", property_id: "p3",  guest_id: "g17", channel_id: "ch4", check_in: "2026-03-15", check_out: "2026-03-19", status: "completed" },
  { id: "r18", property_id: "p3",  guest_id: "g18", channel_id: "ch1", check_in: "2026-04-19", check_out: "2026-04-23", status: "confirmed" },
  { id: "r19", property_id: "p3",  guest_id: "g19", channel_id: "ch2", check_in: "2026-05-03", check_out: "2026-05-08", status: "confirmed" },
  { id: "r20", property_id: "p3",  guest_id: "g20", channel_id: "ch4", check_in: "2026-06-20", check_out: "2026-06-27", status: "confirmed" },

  // p4 — Gulf View 201
  { id: "r21", property_id: "p4",  guest_id: "g21", channel_id: "ch1", check_in: "2026-02-07", check_out: "2026-02-10", status: "completed" },
  { id: "r22", property_id: "p4",  guest_id: "g22", channel_id: "ch4", check_in: "2026-03-22", check_out: "2026-03-25", status: "completed" },
  { id: "r23", property_id: "p4",  guest_id: "g23", channel_id: "ch1", check_in: "2026-04-26", check_out: "2026-04-30", status: "confirmed" },
  { id: "r24", property_id: "p4",  guest_id: "g24", channel_id: "ch4", check_in: "2026-05-17", check_out: "2026-05-20", status: "confirmed" },

  // p5 — Pelican Perch
  { id: "r25", property_id: "p5",  guest_id: "g25", channel_id: "ch1", check_in: "2026-01-18", check_out: "2026-01-23", status: "completed" },
  { id: "r26", property_id: "p5",  guest_id: "g26", channel_id: "ch2", check_in: "2026-03-07", check_out: "2026-03-12", status: "completed" },
  { id: "r27", property_id: "p5",  guest_id: "g27", channel_id: "ch3", check_in: "2026-04-25", check_out: "2026-05-02", status: "confirmed" },
  { id: "r28", property_id: "p5",  guest_id: "g28", channel_id: "ch1", check_in: "2026-06-13", check_out: "2026-06-20", status: "confirmed" },

  // p6 — Tarpon Flats
  { id: "r29", property_id: "p6",  guest_id: "g29", channel_id: "ch1", check_in: "2026-02-10", check_out: "2026-02-14", status: "completed" },
  { id: "r30", property_id: "p6",  guest_id: "g30", channel_id: "ch2", check_in: "2026-03-28", check_out: "2026-04-01", status: "completed" },
  { id: "r31", property_id: "p6",  guest_id: "g31", channel_id: "ch4", check_in: "2026-04-22", check_out: "2026-04-27", status: "confirmed" },
  { id: "r32", property_id: "p6",  guest_id: "g32", channel_id: "ch1", check_in: "2026-05-30", check_out: "2026-06-06", status: "confirmed" },

  // p7 — Driftwood House
  { id: "r33", property_id: "p7",  guest_id: "g33", channel_id: "ch1", check_in: "2026-01-26", check_out: "2026-02-01", status: "completed" },
  { id: "r34", property_id: "p7",  guest_id: "g34", channel_id: "ch2", check_in: "2026-03-14", check_out: "2026-03-19", status: "completed" },
  { id: "r35", property_id: "p7",  guest_id: "g35", channel_id: "ch3", check_in: "2026-04-19", check_out: "2026-04-24", status: "confirmed" },
  { id: "r36", property_id: "p7",  guest_id: "g36", channel_id: "ch1", check_in: "2026-05-22", check_out: "2026-05-29", status: "confirmed" },

  // p8 — Blue Heron Bungalow
  { id: "r37", property_id: "p8",  guest_id: "g37", channel_id: "ch1", check_in: "2026-02-15", check_out: "2026-02-19", status: "completed" },
  { id: "r38", property_id: "p8",  guest_id: "g38", channel_id: "ch4", check_in: "2026-04-10", check_out: "2026-04-14", status: "completed" },
  { id: "r39", property_id: "p8",  guest_id: "g39", channel_id: "ch1", check_in: "2026-05-08", check_out: "2026-05-12", status: "confirmed" },
  { id: "r40", property_id: "p8",  guest_id: "g40", channel_id: "ch4", check_in: "2026-06-27", check_out: "2026-07-04", status: "confirmed" },

  // p9 — Port Royal 305
  { id: "r41", property_id: "p9",  guest_id: "g1",  channel_id: "ch1", check_in: "2026-01-31", check_out: "2026-02-05", status: "completed" },
  { id: "r42", property_id: "p9",  guest_id: "g2",  channel_id: "ch2", check_in: "2026-03-20", check_out: "2026-03-25", status: "completed" },
  { id: "r43", property_id: "p9",  guest_id: "g3",  channel_id: "ch1", check_in: "2026-04-27", check_out: "2026-05-03", status: "confirmed" },

  // p10 — Tide Pool House
  { id: "r44", property_id: "p10", guest_id: "g4",  channel_id: "ch2", check_in: "2026-02-20", check_out: "2026-02-25", status: "completed" },
  { id: "r45", property_id: "p10", guest_id: "g5",  channel_id: "ch1", check_in: "2026-04-05", check_out: "2026-04-10", status: "completed" },
  { id: "r46", property_id: "p10", guest_id: "g6",  channel_id: "ch3", check_in: "2026-05-15", check_out: "2026-05-22", status: "confirmed" },

  // p11 — Island Pines
  { id: "r47", property_id: "p11", guest_id: "g7",  channel_id: "ch1", check_in: "2026-01-08", check_out: "2026-01-12", status: "completed" },
  { id: "r48", property_id: "p11", guest_id: "g8",  channel_id: "ch2", check_in: "2026-04-15", check_out: "2026-04-19", status: "completed" },
  { id: "r49", property_id: "p11", guest_id: "g9",  channel_id: "ch4", check_in: "2026-04-26", check_out: "2026-05-01", status: "confirmed" },

  // p12 — Sand Dollar Suite
  { id: "r50", property_id: "p12", guest_id: "g10", channel_id: "ch1", check_in: "2026-03-05", check_out: "2026-03-08", status: "completed" },
  { id: "r51", property_id: "p12", guest_id: "g11", channel_id: "ch1", check_in: "2026-04-21", check_out: "2026-04-24", status: "confirmed" },

  // p13 — Marlin's Rest
  { id: "r52", property_id: "p13", guest_id: "g12", channel_id: "ch1", check_in: "2026-02-14", check_out: "2026-02-19", status: "completed" },
  { id: "r53", property_id: "p13", guest_id: "g13", channel_id: "ch2", check_in: "2026-04-19", check_out: "2026-04-24", status: "confirmed" },
  { id: "r54", property_id: "p13", guest_id: "g14", channel_id: "ch4", check_in: "2026-05-28", check_out: "2026-06-04", status: "confirmed" },

  // p14 — Lighthouse Landing
  { id: "r55", property_id: "p14", guest_id: "g15", channel_id: "ch1", check_in: "2026-01-22", check_out: "2026-01-26", status: "completed" },
  { id: "r56", property_id: "p14", guest_id: "g16", channel_id: "ch2", check_in: "2026-03-28", check_out: "2026-04-02", status: "completed" },
  { id: "r57", property_id: "p14", guest_id: "g17", channel_id: "ch1", check_in: "2026-05-09", check_out: "2026-05-16", status: "confirmed" },

  // p15 — Bayside Retreat
  { id: "r58", property_id: "p15", guest_id: "g18", channel_id: "ch1", check_in: "2026-02-08", check_out: "2026-02-13", status: "completed" },
  { id: "r59", property_id: "p15", guest_id: "g19", channel_id: "ch2", check_in: "2026-04-20", check_out: "2026-04-26", status: "confirmed" },

  // p16 — Salty Dog Cottage
  { id: "r60", property_id: "p16", guest_id: "g20", channel_id: "ch1", check_in: "2026-03-12", check_out: "2026-03-15", status: "completed" },
  { id: "r61", property_id: "p16", guest_id: "g21", channel_id: "ch4", check_in: "2026-05-04", check_out: "2026-05-07", status: "confirmed" },

  // p17 — Osprey's Nest
  { id: "r62", property_id: "p17", guest_id: "g22", channel_id: "ch1", check_in: "2026-02-27", check_out: "2026-03-03", status: "completed" },
  { id: "r63", property_id: "p17", guest_id: "g23", channel_id: "ch2", check_in: "2026-04-22", check_out: "2026-04-26", status: "confirmed" },

  // p18 — Breakwater 202
  { id: "r64", property_id: "p18", guest_id: "g24", channel_id: "ch1", check_in: "2026-01-15", check_out: "2026-01-19", status: "completed" },
  { id: "r65", property_id: "p18", guest_id: "g25", channel_id: "ch1", check_in: "2026-04-28", check_out: "2026-05-04", status: "confirmed" },

  // p19 — Palmetto Place
  { id: "r66", property_id: "p19", guest_id: "g26", channel_id: "ch2", check_in: "2026-03-18", check_out: "2026-03-23", status: "completed" },
  { id: "r67", property_id: "p19", guest_id: "g27", channel_id: "ch1", check_in: "2026-05-17", check_out: "2026-05-24", status: "confirmed" },

  // p20 — Surfside 8
  { id: "r68", property_id: "p20", guest_id: "g28", channel_id: "ch1", check_in: "2026-02-22", check_out: "2026-02-26", status: "completed" },
  { id: "r69", property_id: "p20", guest_id: "g29", channel_id: "ch2", check_in: "2026-04-24", check_out: "2026-04-29", status: "confirmed" },

  // p21 — Shell Seeker
  { id: "r70", property_id: "p21", guest_id: "g30", channel_id: "ch1", check_in: "2026-04-01", check_out: "2026-04-05", status: "completed" },
  { id: "r71", property_id: "p21", guest_id: "g31", channel_id: "ch4", check_in: "2026-05-20", check_out: "2026-05-24", status: "confirmed" },

  // p22 — Coastal Cove
  { id: "r72", property_id: "p22", guest_id: "g32", channel_id: "ch1", check_in: "2026-01-03", check_out: "2026-01-08", status: "completed" },
  { id: "r73", property_id: "p22", guest_id: "g33", channel_id: "ch3", check_in: "2026-04-25", check_out: "2026-05-02", status: "confirmed" },

  // p23 — Sunrise Suite
  { id: "r74", property_id: "p23", guest_id: "g34", channel_id: "ch1", check_in: "2026-03-07", check_out: "2026-03-10", status: "completed" },
  { id: "r75", property_id: "p23", guest_id: "g35", channel_id: "ch4", check_in: "2026-05-12", check_out: "2026-05-15", status: "confirmed" },

  // p24 — Deckhouse at Horace Caldwell
  { id: "r76", property_id: "p24", guest_id: "g36", channel_id: "ch1", check_in: "2026-02-01", check_out: "2026-02-06", status: "completed" },
  { id: "r77", property_id: "p24", guest_id: "g37", channel_id: "ch2", check_in: "2026-04-23", check_out: "2026-04-28", status: "confirmed" },

  // === Q1 VOLUME EXPANSION (r78-r114) ===
  // 37 additional completed reservations with check_out in Jan/Feb/Mar 2026.
  // Distributed across all 24 properties, weighted by nightly rate; Sarah
  // Whitaker's portfolio (o1) over-weighted to reflect full-service client
  // status. Channel mix ~46/19/11/24 (Airbnb/VRBO/Booking/Direct).
  // Post-expansion Q1 totals: 71 completed reservations, ~$79K owner_payout.

  // p1 — Sandcastle 412 (Sarah) +4
  { id: "r78",  property_id: "p1",  guest_id: "g41", channel_id: "ch1", check_in: "2026-01-01", check_out: "2026-01-05", status: "completed" },
  { id: "r79",  property_id: "p1",  guest_id: "g15", channel_id: "ch2", check_in: "2026-02-04", check_out: "2026-02-09", status: "completed" },
  { id: "r80",  property_id: "p1",  guest_id: "g42", channel_id: "ch1", check_in: "2026-03-14", check_out: "2026-03-21", status: "completed" },
  { id: "r114", property_id: "p1",  guest_id: "g31", channel_id: "ch2", check_in: "2026-02-22", check_out: "2026-02-27", status: "completed" },

  // p2 — Mustang Towers 7B (Sarah) +4
  { id: "r81",  property_id: "p2",  guest_id: "g43", channel_id: "ch1", check_in: "2026-01-16", check_out: "2026-01-21", status: "completed" },
  { id: "r82",  property_id: "p2",  guest_id: "g22", channel_id: "ch4", check_in: "2026-02-14", check_out: "2026-02-19", status: "completed" },
  { id: "r83",  property_id: "p2",  guest_id: "g44", channel_id: "ch3", check_in: "2026-03-13", check_out: "2026-03-20", status: "completed" },
  { id: "r113", property_id: "p2",  guest_id: "g26", channel_id: "ch1", check_in: "2026-02-21", check_out: "2026-02-27", status: "completed" },

  // p3 — Sea Breeze Cottage (Sarah) +2
  { id: "r84",  property_id: "p3",  guest_id: "g8",  channel_id: "ch1", check_in: "2026-01-03", check_out: "2026-01-08", status: "completed" },
  { id: "r85",  property_id: "p3",  guest_id: "g29", channel_id: "ch4", check_in: "2026-03-07", check_out: "2026-03-12", status: "completed" },

  // p4 — Gulf View 201 (Sarah) +2
  { id: "r86",  property_id: "p4",  guest_id: "g33", channel_id: "ch1", check_in: "2026-01-09", check_out: "2026-01-14", status: "completed" },
  { id: "r87",  property_id: "p4",  guest_id: "g45", channel_id: "ch4", check_in: "2026-02-20", check_out: "2026-02-24", status: "completed" },

  // p5 — Pelican Perch (o2) +2
  { id: "r88",  property_id: "p5",  guest_id: "g2",  channel_id: "ch1", check_in: "2026-02-06", check_out: "2026-02-11", status: "completed" },
  { id: "r89",  property_id: "p5",  guest_id: "g46", channel_id: "ch3", check_in: "2026-03-20", check_out: "2026-03-26", status: "completed" },

  // p6 — Tarpon Flats (o2) +1
  { id: "r90",  property_id: "p6",  guest_id: "g34", channel_id: "ch1", check_in: "2026-01-10", check_out: "2026-01-14", status: "completed" },

  // p7 — Driftwood House (o3) +2
  { id: "r91",  property_id: "p7",  guest_id: "g47", channel_id: "ch2", check_in: "2026-02-21", check_out: "2026-02-27", status: "completed" },
  { id: "r92",  property_id: "p7",  guest_id: "g48", channel_id: "ch1", check_in: "2026-03-06", check_out: "2026-03-13", status: "completed" },

  // p9 — Port Royal 305 (o4) +1
  { id: "r93",  property_id: "p9",  guest_id: "g4",  channel_id: "ch4", check_in: "2026-02-12", check_out: "2026-02-16", status: "completed" },

  // p10 — Tide Pool House (o4) +2
  { id: "r94",  property_id: "p10", guest_id: "g10", channel_id: "ch4", check_in: "2026-01-15", check_out: "2026-01-21", status: "completed" },
  { id: "r95",  property_id: "p10", guest_id: "g21", channel_id: "ch2", check_in: "2026-03-08", check_out: "2026-03-14", status: "completed" },

  // p11 — Island Pines (o5) +1
  { id: "r96",  property_id: "p11", guest_id: "g32", channel_id: "ch1", check_in: "2026-02-27", check_out: "2026-03-03", status: "completed" },

  // p13 — Marlin's Rest (o6) +1
  { id: "r97",  property_id: "p13", guest_id: "g49", channel_id: "ch1", check_in: "2026-03-22", check_out: "2026-03-28", status: "completed" },

  // p14 — Lighthouse Landing (o7) +1
  { id: "r98",  property_id: "p14", guest_id: "g3",  channel_id: "ch2", check_in: "2026-03-14", check_out: "2026-03-19", status: "completed" },

  // p15 — Bayside Retreat (o8) +2
  { id: "r99",  property_id: "p15", guest_id: "g50", channel_id: "ch1", check_in: "2026-01-24", check_out: "2026-01-29", status: "completed" },
  { id: "r100", property_id: "p15", guest_id: "g27", channel_id: "ch2", check_in: "2026-03-10", check_out: "2026-03-16", status: "completed" },

  // p17 — Osprey's Nest (o9) +1
  { id: "r101", property_id: "p17", guest_id: "g36", channel_id: "ch4", check_in: "2026-01-11", check_out: "2026-01-15", status: "completed" },

  // p18 — Breakwater 202 (o10) +1
  { id: "r102", property_id: "p18", guest_id: "g5",  channel_id: "ch1", check_in: "2026-02-14", check_out: "2026-02-18", status: "completed" },

  // p19 — Palmetto Place (o11) +2
  { id: "r103", property_id: "p19", guest_id: "g19", channel_id: "ch1", check_in: "2026-01-23", check_out: "2026-01-28", status: "completed" },
  { id: "r104", property_id: "p19", guest_id: "g51", channel_id: "ch3", check_in: "2026-03-08", check_out: "2026-03-14", status: "completed" },

  // p20 — Surfside 8 (o12) +1
  { id: "r105", property_id: "p20", guest_id: "g30", channel_id: "ch4", check_in: "2026-02-07", check_out: "2026-02-11", status: "completed" },

  // p21 — Shell Seeker (o13) +2
  { id: "r106", property_id: "p21", guest_id: "g52", channel_id: "ch1", check_in: "2026-02-14", check_out: "2026-02-18", status: "completed" },
  { id: "r107", property_id: "p21", guest_id: "g39", channel_id: "ch4", check_in: "2026-03-18", check_out: "2026-03-22", status: "completed" },

  // p22 — Coastal Cove (o14) +2
  { id: "r108", property_id: "p22", guest_id: "g11", channel_id: "ch1", check_in: "2026-02-19", check_out: "2026-02-24", status: "completed" },
  { id: "r109", property_id: "p22", guest_id: "g17", channel_id: "ch3", check_in: "2026-03-07", check_out: "2026-03-14", status: "completed" },

  // p23 — Sunrise Suite (o15) +1
  { id: "r110", property_id: "p23", guest_id: "g24", channel_id: "ch4", check_in: "2026-01-26", check_out: "2026-01-30", status: "completed" },

  // p24 — Deckhouse at Horace Caldwell (o16) +2
  { id: "r111", property_id: "p24", guest_id: "g20", channel_id: "ch1", check_in: "2026-01-18", check_out: "2026-01-23", status: "completed" },
  { id: "r112", property_id: "p24", guest_id: "g38", channel_id: "ch2", check_in: "2026-03-21", check_out: "2026-03-27", status: "completed" },
];

// =============================================================================
// PROPERTIES (24)
// owner distribution: o1→4, o2→2, o3→2, o4→2, o5→1, o6→2, o7→1,
//                    o8→2, o9→1, o10→1, o11→1, o12→1, o13→1, o14→1, o15→1, o16→1
// taxes_pct: 0.15 (TX state 6% + City of Port Aransas 9%, effective Jan 1 2026)
// mgmt_fee_pct: 0.18–0.22, weighted toward 0.20
// =============================================================================

const PROPERTIES = [
  // Sarah Whitaker (o1) — 4 properties
  {
    id: "p1", owner_id: "o1",
    name: "Sandcastle 412", address: "412 Beach Ave, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 6,
    nightly_rate: 285, cleaning_fee: 150, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Gulf view", "Private balcony", "Full kitchen", "WiFi", "Pool access", "2 parking spots"],
    photo_url: "img/p1.jpg",
  },
  {
    id: "p2", owner_id: "o1",
    name: "Mustang Towers 7B", address: "700 Access Rd, Port Aransas, TX 78373",
    beds: 3, baths: 2, sleeps: 8,
    nightly_rate: 375, cleaning_fee: 175, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Beachfront", "Elevator", "Full kitchen", "WiFi", "Pool", "3 parking spots"],
    photo_url: "img/p2.jpg",
  },
  {
    id: "p3", owner_id: "o1",
    name: "Sea Breeze Cottage", address: "118 Cotter Ave, Port Aransas, TX 78373",
    beds: 2, baths: 1, sleeps: 4,
    nightly_rate: 210, cleaning_fee: 120, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Pet friendly", "Fenced yard", "Full kitchen", "WiFi", "Outdoor shower", "1 parking spot"],
    photo_url: "img/p3.jpg",
  },
  {
    id: "p4", owner_id: "o1",
    name: "Gulf View 201", address: "201 Station St, Port Aransas, TX 78373",
    beds: 1, baths: 1, sleeps: 2,
    nightly_rate: 165, cleaning_fee: 100, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Gulf view", "Pool access", "Full kitchen", "WiFi", "1 parking spot"],
    photo_url: "img/p4.jpg",
  },

  // Marcus Chen (o2) — 2 properties
  {
    id: "p5", owner_id: "o2",
    name: "Pelican Perch", address: "845 Padre Blvd, Port Aransas, TX 78373",
    beds: 3, baths: 3, sleeps: 8,
    nightly_rate: 420, cleaning_fee: 200, taxes_pct: 0.15, mgmt_fee_pct: 0.18,
    amenities: ["Private pool", "Game room", "Outdoor kitchen", "WiFi", "Gulf views", "3 parking spots"],
    photo_url: "img/p5.jpg",
  },
  {
    id: "p6", owner_id: "o2",
    name: "Tarpon Flats", address: "302 Cut Off Rd, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 5,
    nightly_rate: 245, cleaning_fee: 135, taxes_pct: 0.15, mgmt_fee_pct: 0.18,
    amenities: ["Bay view", "Boat dock", "Full kitchen", "WiFi", "Fish cleaning station", "2 parking spots"],
    photo_url: "img/p6.jpg",
  },

  // Diane Kowalski (o3) — 2 properties
  {
    id: "p7", owner_id: "o3",
    name: "Driftwood House", address: "56 W Cotter Ave, Port Aransas, TX 78373",
    beds: 4, baths: 3, sleeps: 10,
    nightly_rate: 425, cleaning_fee: 195, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Private pool", "Large deck", "Full kitchen", "WiFi", "Outdoor shower", "4 parking spots"],
    photo_url: "img/p7.jpg",
  },
  {
    id: "p8", owner_id: "o3",
    name: "Blue Heron Bungalow", address: "29 Alister St, Port Aransas, TX 78373",
    beds: 2, baths: 1, sleeps: 4,
    nightly_rate: 195, cleaning_fee: 110, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Birdwatching", "Kayak storage", "Full kitchen", "WiFi", "1 parking spot"],
    photo_url: "img/p8.jpg",
  },

  // Robert Tran (o4) — 2 properties
  {
    id: "p9", owner_id: "o4",
    name: "Port Royal 305", address: "305 N Station St, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 6,
    nightly_rate: 310, cleaning_fee: 155, taxes_pct: 0.15, mgmt_fee_pct: 0.22,
    amenities: ["Gulf view", "Pool", "Hot tub", "Full kitchen", "WiFi", "2 parking spots"],
    photo_url: "img/p9.jpg",
  },
  {
    id: "p10", owner_id: "o4",
    name: "Tide Pool House", address: "77 Rincon Dr, Port Aransas, TX 78373",
    beds: 3, baths: 2, sleeps: 7,
    nightly_rate: 350, cleaning_fee: 165, taxes_pct: 0.15, mgmt_fee_pct: 0.22,
    amenities: ["Beach access", "Outdoor shower", "Full kitchen", "WiFi", "Game room", "3 parking spots"],
    photo_url: "img/p10.jpg",
  },

  // Linda Okafor (o5) — 1 property
  {
    id: "p11", owner_id: "o5",
    name: "Island Pines", address: "114 S Alister St, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 5,
    nightly_rate: 230, cleaning_fee: 130, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Shaded lot", "Hammock garden", "Full kitchen", "WiFi", "2 parking spots"],
    photo_url: "img/p11.jpg",
  },

  // James Harrington (o6) — 2 properties
  {
    id: "p12", owner_id: "o6",
    name: "Sand Dollar Suite", address: "501 E Ave G, Port Aransas, TX 78373",
    beds: 1, baths: 1, sleeps: 3,
    nightly_rate: 155, cleaning_fee: 95, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Pool access", "Walk to beach", "Full kitchen", "WiFi", "1 parking spot"],
    photo_url: "img/p12.jpg",
  },
  {
    id: "p13", owner_id: "o6",
    name: "Marlin's Rest", address: "88 N Cut Off Rd, Port Aransas, TX 78373",
    beds: 3, baths: 2, sleeps: 8,
    nightly_rate: 330, cleaning_fee: 160, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Canal access", "Fishing pier", "Full kitchen", "WiFi", "3 parking spots"],
    photo_url: "img/p13.jpg",
  },

  // Patricia Nguyen (o7) — 1 property
  {
    id: "p14", owner_id: "o7",
    name: "Lighthouse Landing", address: "222 Cutter St, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 6,
    nightly_rate: 275, cleaning_fee: 145, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Harbor view", "Rooftop deck", "Full kitchen", "WiFi", "2 parking spots"],
    photo_url: "img/p14.jpg",
  },

  // David Ruiz (o8) — 2 properties
  {
    id: "p15", owner_id: "o8",
    name: "Bayside Retreat", address: "19 Conn Brown Harbor Rd, Port Aransas, TX 78373",
    beds: 3, baths: 2, sleeps: 7,
    nightly_rate: 340, cleaning_fee: 165, taxes_pct: 0.15, mgmt_fee_pct: 0.18,
    amenities: ["Bay views", "Kayak launch", "Full kitchen", "WiFi", "Outdoor dining", "3 parking spots"],
    photo_url: "img/p15.jpg",
  },
  {
    id: "p16", owner_id: "o8",
    name: "Salty Dog Cottage", address: "43 W Ave A, Port Aransas, TX 78373",
    beds: 1, baths: 1, sleeps: 2,
    nightly_rate: 150, cleaning_fee: 90, taxes_pct: 0.15, mgmt_fee_pct: 0.18,
    amenities: ["Pet friendly", "Fenced yard", "Kitchenette", "WiFi", "1 parking spot"],
    photo_url: "img/p16.jpg",
  },

  // Karen Stevenson (o9) — 1 property
  {
    id: "p17", owner_id: "o9",
    name: "Osprey's Nest", address: "67 Trout St, Port Aransas, TX 78373",
    beds: 2, baths: 1, sleeps: 4,
    nightly_rate: 220, cleaning_fee: 125, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Wildlife refuge view", "Screened porch", "Full kitchen", "WiFi", "2 parking spots"],
    photo_url: "img/p17.jpg",
  },

  // Thomas Belfort (o10) — 1 property
  {
    id: "p18", owner_id: "o10",
    name: "Breakwater 202", address: "202 Whitman Dr, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 6,
    nightly_rate: 295, cleaning_fee: 150, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Gulf views", "Pool", "Covered parking", "Full kitchen", "WiFi", "2 parking spots"],
    photo_url: "img/p18.jpg",
  },

  // Angela Morales (o11) — 1 property
  {
    id: "p19", owner_id: "o11",
    name: "Palmetto Place", address: "91 S Station St, Port Aransas, TX 78373",
    beds: 3, baths: 2, sleeps: 8,
    nightly_rate: 360, cleaning_fee: 170, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Private pool", "Outdoor kitchen", "Full kitchen", "WiFi", "3 parking spots"],
    photo_url: "img/p19.jpg",
  },

  // Greg Sutton (o12) — 1 property
  {
    id: "p20", owner_id: "o12",
    name: "Surfside 8", address: "8 Surfside Dr, Port Aransas, TX 78373",
    beds: 2, baths: 2, sleeps: 5,
    nightly_rate: 250, cleaning_fee: 135, taxes_pct: 0.15, mgmt_fee_pct: 0.22,
    amenities: ["Beachside", "Surf storage", "Full kitchen", "WiFi", "2 parking spots"],
    photo_url: "img/p20.jpg",
  },

  // Michelle Park (o13) — 1 property
  {
    id: "p21", owner_id: "o13",
    name: "Shell Seeker", address: "33 Ave C, Port Aransas, TX 78373",
    beds: 2, baths: 1, sleeps: 4,
    nightly_rate: 200, cleaning_fee: 115, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Beach access", "Outdoor shower", "Full kitchen", "WiFi", "1 parking spot"],
    photo_url: "img/p21.jpg",
  },

  // Frank Delacroix (o14) — 1 property
  {
    id: "p22", owner_id: "o14",
    name: "Coastal Cove", address: "155 Ave H, Port Aransas, TX 78373",
    beds: 4, baths: 3, sleeps: 10,
    nightly_rate: 415, cleaning_fee: 190, taxes_pct: 0.15, mgmt_fee_pct: 0.18,
    amenities: ["Gulf view", "Private pool", "Outdoor bar", "Full kitchen", "WiFi", "4 parking spots"],
    photo_url: "img/p22.jpg",
  },

  // Joyce Andersen (o15) — 1 property
  {
    id: "p23", owner_id: "o15",
    name: "Sunrise Suite", address: "410 E Ave B, Port Aransas, TX 78373",
    beds: 1, baths: 1, sleeps: 2,
    nightly_rate: 170, cleaning_fee: 100, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["East-facing sunrise view", "Pool access", "Kitchenette", "WiFi", "1 parking spot"],
    photo_url: "img/p23.jpg",
  },

  // Carl Washington (o16) — 1 property
  {
    id: "p24", owner_id: "o16",
    name: "Deckhouse at Horace Caldwell", address: "11 Bob Hall Pier Rd, Port Aransas, TX 78373",
    beds: 3, baths: 2, sleeps: 7,
    nightly_rate: 385, cleaning_fee: 175, taxes_pct: 0.15, mgmt_fee_pct: 0.20,
    amenities: ["Pier access", "Fish cleaning station", "Full kitchen", "WiFi", "3 parking spots"],
    photo_url: "img/p24.jpg",
  },
];

// =============================================================================
// RATE PERIODS (8)
// Market-wide periods (property_id: null) set min_stay + label; base nightly rate applies.
// Property-specific periods override the nightly rate for premium listings.
// =============================================================================

const RATE_PERIODS = [
  { id: "rp1", property_id: null, start_date: "2026-05-15", end_date: "2026-09-15", nightly_rate_override: null, min_stay: 7, label: "Summer Peak"      },
  { id: "rp2", property_id: null, start_date: "2026-03-07", end_date: "2026-03-22", nightly_rate_override: null, min_stay: 4, label: "Spring Break"     },
  { id: "rp3", property_id: null, start_date: "2026-07-01", end_date: "2026-07-07", nightly_rate_override: null, min_stay: 5, label: "July 4th Week"    },
  { id: "rp4", property_id: null, start_date: "2026-11-22", end_date: "2026-11-29", nightly_rate_override: null, min_stay: 4, label: "Thanksgiving Week" },
  { id: "rp5", property_id: null, start_date: "2026-12-20", end_date: "2026-12-31", nightly_rate_override: null, min_stay: 5, label: "Christmas Week"   },
  { id: "rp6", property_id: "p2", start_date: "2026-06-01", end_date: "2026-08-15", nightly_rate_override: 495,  min_stay: 7, label: "Mustang Towers 7B — Peak Premium" },
  { id: "rp7", property_id: "p5", start_date: "2026-06-01", end_date: "2026-08-15", nightly_rate_override: 575,  min_stay: 7, label: "Pelican Perch — Peak Premium"     },
  { id: "rp8", property_id: "p7", start_date: "2026-06-01", end_date: "2026-08-15", nightly_rate_override: 550,  min_stay: 7, label: "Driftwood House — Peak Premium"   },
];

// =============================================================================
// MAINTENANCE TICKETS (6)
// Severity: low | medium | high  ·  Status: open | in_progress | resolved
// Two tickets on Sarah Whitaker's portfolio (o1): p1 and p3.
// =============================================================================

const MAINTENANCE_TICKETS = [
  {
    id: "mt1", property_id: "p1", vendor_id: "v2",
    severity: "high", status: "in_progress",
    title: "AC not cooling below 78°F",
    description: "Guest reported AC struggling on 2nd floor. Tech on site, likely compressor capacitor. Parts ordered.",
    cost: 485.00, reported_at: "2026-04-17", resolved_at: null,
  },
  {
    id: "mt2", property_id: "p3", vendor_id: "v4",
    severity: "low", status: "resolved",
    title: "Kitchen disposal jammed",
    description: "Fork lodged in disposal. Cleared and tested. No replacement needed.",
    cost: 125.00, reported_at: "2026-04-02", resolved_at: "2026-04-03",
  },
  {
    id: "mt3", property_id: "p7", vendor_id: "v2",
    severity: "medium", status: "open",
    title: "Pool light out on deep end",
    description: "Owner request — underwater LED failed. Vendor scheduled for 2026-04-22.",
    cost: 280.00, reported_at: "2026-04-18", resolved_at: null,
  },
  {
    id: "mt4", property_id: "p10", vendor_id: "v2",
    severity: "high", status: "in_progress",
    title: "Roof leak over master bedroom",
    description: "Active leak after 4/14 storm. Tarped 4/15, shingle repair scheduled 4/21. Insurance claim opened.",
    cost: 1250.00, reported_at: "2026-04-15", resolved_at: null,
  },
  {
    id: "mt5", property_id: "p13", vendor_id: "v4",
    severity: "medium", status: "resolved",
    title: "Hot tub heater not firing",
    description: "Heating element replaced, retested full heat cycle. Owner approved.",
    cost: 340.00, reported_at: "2026-03-28", resolved_at: "2026-03-31",
  },
  {
    id: "mt6", property_id: "p18", vendor_id: "v4",
    severity: "low", status: "open",
    title: "Garbage disposal replacement",
    description: "Unit is ~12 years old and humming without spinning. Replacement quoted, awaiting owner approval.",
    cost: 215.00, reported_at: "2026-04-19", resolved_at: null,
  },
];

// =============================================================================
// CLEANING TASKS (10)
// Today (2026-04-19): 1 post-checkout turnover (r48→p11) + 3 pre-arrival cleans
//   for today's check-ins (r18→p3, r35→p7, r53→p13).
// Tomorrow (2026-04-20): 3 tasks. Rest of the week: 3 tasks.
// reservation_id is the reservation the clean services (incoming for pre-arrival,
//   outgoing for post-checkout). null for non-reservation cleans (post-repair, etc).
// Status: scheduled | in_progress | complete
// =============================================================================

const CLEANING_TASKS = [
  {
    id: "ct1", property_id: "p11", reservation_id: "r48", vendor_id: "v1",
    scheduled_for: "2026-04-19", status: "in_progress",
    notes: "Post-checkout turnover for r48. Standard 3hr clean + full linen swap. No next guest until 4/26.",
  },
  {
    id: "ct2", property_id: "p3",  reservation_id: "r18", vendor_id: "v3",
    scheduled_for: "2026-04-19", status: "complete",
    notes: "Pre-arrival clean for r18 (4pm check-in). Completed 11:40 AM.",
  },
  {
    id: "ct3", property_id: "p7",  reservation_id: "r35", vendor_id: "v1",
    scheduled_for: "2026-04-19", status: "complete",
    notes: "Pre-arrival clean for r35 (party of 8, 4pm check-in). Completed 12:20 PM. Pool deck hosed, grill inspected.",
  },
  {
    id: "ct4", property_id: "p13", reservation_id: "r53", vendor_id: "v3",
    scheduled_for: "2026-04-19", status: "complete",
    notes: "Pre-arrival clean for r53 (4pm check-in). Completed 1:05 PM. Restocked welcome basket.",
  },
  {
    id: "ct5", property_id: "p15", reservation_id: "r59", vendor_id: "v1",
    scheduled_for: "2026-04-20", status: "scheduled",
    notes: "Pre-arrival clean for r59 (4/20 check-in). 7-person booking; extra linen set staged.",
  },
  {
    id: "ct6", property_id: "p12", reservation_id: "r51", vendor_id: "v3",
    scheduled_for: "2026-04-20", status: "scheduled",
    notes: "Pre-arrival clean for r51 (4/21 check-in). Day-before scheduling due to vendor capacity.",
  },
  {
    id: "ct7", property_id: "p10", reservation_id: null,  vendor_id: "v1",
    scheduled_for: "2026-04-20", status: "scheduled",
    notes: "Deep clean after roof leak remediation (see mt4). Carpet extraction + sanitize master bedroom.",
  },
  {
    id: "ct8", property_id: "p1",  reservation_id: "r6",  vendor_id: "v1",
    scheduled_for: "2026-04-22", status: "scheduled",
    notes: "Pre-arrival clean for r6 (4/22 check-in).",
  },
  {
    id: "ct9", property_id: "p6",  reservation_id: "r31", vendor_id: "v3",
    scheduled_for: "2026-04-22", status: "scheduled",
    notes: "Pre-arrival clean for r31 (4/22 check-in). Confirm bay-side patio furniture reset after last storm.",
  },
  {
    id: "ct10", property_id: "p3", reservation_id: "r18", vendor_id: "v3",
    scheduled_for: "2026-04-23", status: "scheduled",
    notes: "Post-checkout turnover for r18. Next guest r19 arrives 5/3.",
  },
];

// =============================================================================
// ADJUSTMENTS (8)
// Manual line items applied to specific owner statements.
// Categories: refund | credit | repair_pass_through | manual
// Sign convention: negative reduces owner net (refund/repair); positive increases.
// Every statement_id referenced here must exist in STATEMENTS below.
// =============================================================================

const ADJUSTMENTS = [
  {
    id: "a1", statement_id: "stmt_o6_2026-03",
    category: "repair_pass_through", amount: -340.00, date: "2026-03-31",
    memo: "Hot tub heater replacement at Marlin's Rest (p13). See maintenance ticket mt5.",
  },
  {
    id: "a2", statement_id: "stmt_o1_2026-02",
    category: "refund", amount: -175.00, date: "2026-02-18",
    memo: "Guest refund on r3: WiFi outage 2/16. Owner share of goodwill credit issued to guest.",
  },
  {
    id: "a3", statement_id: "stmt_o1_2026-03",
    category: "manual", amount: 65.00, date: "2026-03-27",
    memo: "Linen billing from Feb statement reclassified as cleaning pass-through. Returning to owner.",
  },
  {
    id: "a4", statement_id: "stmt_o4_2026-02",
    category: "repair_pass_through", amount: -225.00, date: "2026-02-22",
    memo: "HVAC filter service at Tide Pool House (p10). Quarterly maintenance, owner pass-through.",
  },
  {
    id: "a5", statement_id: "stmt_o2_2026-03",
    category: "credit", amount: 120.00, date: "2026-03-25",
    memo: "Reconciliation credit: Feb cleaning at Pelican Perch overbilled. Reversed here.",
  },
  {
    id: "a6", statement_id: "stmt_o8_2026-02",
    category: "repair_pass_through", amount: -180.00, date: "2026-02-17",
    memo: "Dishwasher door seal replacement at Bayside Retreat (p15). Owner pass-through.",
  },
  {
    id: "a7", statement_id: "stmt_o3_2026-03",
    category: "manual", amount: -60.00, date: "2026-03-20",
    memo: "Keybox battery pack replacement at Driftwood House (p7).",
  },
  {
    id: "a8", statement_id: "stmt_o10_2026-01",
    category: "refund", amount: -90.00, date: "2026-01-19",
    memo: "Guest r64 early-checkout partial refund (1 night). Owner share.",
  },
];

// =============================================================================
// STATEMENTS (48)
// 16 owners × 3 months (Jan/Feb/Mar 2026). Jan + Feb = "paid"; Mar = "sent".
// Each statement aggregates computeFinancials() across the owner's completed
// reservations whose check_out falls within the period. Zero-activity
// statements are still generated (owner received a "no bookings" statement).
//
// ----------------------------------- VERIFICATION -----------------------------------
//
// Sarah Whitaker (o1) net_to_owner by month:
//   Jan 2026: $7,300.80   (8 reservations, no adjustments)
//   Feb 2026: $8,851.16   (9 reservations, a2 refund -$175.00)
//   Mar 2026: $7,098.34   (7 reservations, a3 manual credit +$65.00)
//   Q1 total: $23,250.30                                  (target range $22K–$26K ✓)
//
// Statement count / status breakdown:
//   16 × Jan 2026 → status "paid"
//   16 × Feb 2026 → status "paid"
//   16 × Mar 2026 → status "sent" (payout in-flight, matching ACH scheduling window)
//   Total: 48 statements (32 paid, 16 sent)
//
// Σ net_to_owner across all 48 statements:
//   Jan 2026: $20,794.95
//   Feb 2026: $27,477.01
//   Mar 2026: $30,209.30
//   Q1 total: $78,481.26
//
// Reconciliation (penny-exact):
//   Σ owner_payout over 71 Q1 completed reservations: $79,366.26
//   Σ adjustments_total (-90 -175 +65 -225 +120 -180 -60 -340 = -$885.00)
//   Reconciled net: $79,366.26 + (-$885.00) = $78,481.26  ✓
// =============================================================================

const STATEMENTS = [
  // --- o1 Sarah Whitaker ---
  { id: "stmt_o1_2026-01",  owner_id: "o1",  period: "2026-01", gross_revenue: 10650.00, channel_fees: 384.00,  cleaning_passthrough: 1140.00, mgmt_fee: 1825.20, adjustments_total:    0.00, net_to_owner: 7300.80, status: "paid" },
  { id: "stmt_o1_2026-02",  owner_id: "o1",  period: "2026-02", gross_revenue: 13280.00, channel_fees: 702.30,  cleaning_passthrough: 1295.00, mgmt_fee: 2256.54, adjustments_total: -175.00, net_to_owner: 8851.16, status: "paid" },
  { id: "stmt_o1_2026-03",  owner_id: "o1",  period: "2026-03", gross_revenue: 10635.00, channel_fees: 853.33,  cleaning_passthrough:  990.00, mgmt_fee: 1758.33, adjustments_total:   65.00, net_to_owner: 7098.34, status: "sent" },

  // --- o2 Marcus Chen ---
  { id: "stmt_o2_2026-01",  owner_id: "o2",  period: "2026-01", gross_revenue:  3415.00, channel_fees: 102.45,  cleaning_passthrough:  335.00, mgmt_fee:  535.96, adjustments_total:    0.00, net_to_owner: 2441.59, status: "paid" },
  { id: "stmt_o2_2026-02",  owner_id: "o2",  period: "2026-02", gross_revenue:  3415.00, channel_fees: 102.45,  cleaning_passthrough:  335.00, mgmt_fee:  535.96, adjustments_total:    0.00, net_to_owner: 2441.59, status: "paid" },
  { id: "stmt_o2_2026-03",  owner_id: "o2",  period: "2026-03", gross_revenue:  5020.00, channel_fees: 592.00,  cleaning_passthrough:  400.00, mgmt_fee:  725.04, adjustments_total:  120.00, net_to_owner: 3422.96, status: "sent" },

  // --- o3 Diane Kowalski ---
  { id: "stmt_o3_2026-01",  owner_id: "o3",  period: "2026-01", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o3_2026-02",  owner_id: "o3",  period: "2026-02", gross_revenue:  6380.00, channel_fees: 328.65,  cleaning_passthrough:  500.00, mgmt_fee: 1110.27, adjustments_total:    0.00, net_to_owner: 4441.08, status: "paid" },
  { id: "stmt_o3_2026-03",  owner_id: "o3",  period: "2026-03", gross_revenue:  5490.00, channel_fees: 280.70,  cleaning_passthrough:  390.00, mgmt_fee:  963.86, adjustments_total:  -60.00, net_to_owner: 3795.44, status: "sent" },

  // --- o4 Robert Tran ---
  { id: "stmt_o4_2026-01",  owner_id: "o4",  period: "2026-01", gross_revenue:  2265.00, channel_fees:  65.69,  cleaning_passthrough:  165.00, mgmt_fee:  447.55, adjustments_total:    0.00, net_to_owner: 1586.76, status: "paid" },
  { id: "stmt_o4_2026-02",  owner_id: "o4",  period: "2026-02", gross_revenue:  5015.00, channel_fees: 244.81,  cleaning_passthrough:  475.00, mgmt_fee:  944.95, adjustments_total: -225.00, net_to_owner: 3125.24, status: "paid" },
  { id: "stmt_o4_2026-03",  owner_id: "o4",  period: "2026-03", gross_revenue:  3970.00, channel_fees: 317.60,  cleaning_passthrough:  320.00, mgmt_fee:  733.13, adjustments_total:    0.00, net_to_owner: 2599.27, status: "sent" },

  // --- o5 Linda Okafor ---
  { id: "stmt_o5_2026-01",  owner_id: "o5",  period: "2026-01", gross_revenue:  1050.00, channel_fees:  31.50,  cleaning_passthrough:  130.00, mgmt_fee:  177.70, adjustments_total:    0.00, net_to_owner:  710.80, status: "paid" },
  { id: "stmt_o5_2026-02",  owner_id: "o5",  period: "2026-02", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o5_2026-03",  owner_id: "o5",  period: "2026-03", gross_revenue:  1050.00, channel_fees:  31.50,  cleaning_passthrough:  130.00, mgmt_fee:  177.70, adjustments_total:    0.00, net_to_owner:  710.80, status: "sent" },

  // --- o6 James Harrington ---
  { id: "stmt_o6_2026-01",  owner_id: "o6",  period: "2026-01", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o6_2026-02",  owner_id: "o6",  period: "2026-02", gross_revenue:  1810.00, channel_fees:  54.30,  cleaning_passthrough:  160.00, mgmt_fee:  319.14, adjustments_total:    0.00, net_to_owner: 1276.56, status: "paid" },
  { id: "stmt_o6_2026-03",  owner_id: "o6",  period: "2026-03", gross_revenue:  2700.00, channel_fees:  81.00,  cleaning_passthrough:  255.00, mgmt_fee:  472.80, adjustments_total: -340.00, net_to_owner: 1551.20, status: "sent" },

  // --- o7 Patricia Nguyen ---
  { id: "stmt_o7_2026-01",  owner_id: "o7",  period: "2026-01", gross_revenue:  1245.00, channel_fees:  37.35,  cleaning_passthrough:  145.00, mgmt_fee:  212.53, adjustments_total:    0.00, net_to_owner:  850.12, status: "paid" },
  { id: "stmt_o7_2026-02",  owner_id: "o7",  period: "2026-02", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o7_2026-03",  owner_id: "o7",  period: "2026-03", gross_revenue:  1520.00, channel_fees: 121.60,  cleaning_passthrough:  145.00, mgmt_fee:  250.68, adjustments_total:    0.00, net_to_owner: 1002.72, status: "sent" },

  // --- o8 David Ruiz ---
  { id: "stmt_o8_2026-01",  owner_id: "o8",  period: "2026-01", gross_revenue:  1865.00, channel_fees:  55.95,  cleaning_passthrough:  165.00, mgmt_fee:  295.93, adjustments_total:    0.00, net_to_owner: 1348.12, status: "paid" },
  { id: "stmt_o8_2026-02",  owner_id: "o8",  period: "2026-02", gross_revenue:  1865.00, channel_fees:  55.95,  cleaning_passthrough:  165.00, mgmt_fee:  295.93, adjustments_total: -180.00, net_to_owner: 1168.12, status: "paid" },
  { id: "stmt_o8_2026-03",  owner_id: "o8",  period: "2026-03", gross_revenue:  2745.00, channel_fees: 192.60,  cleaning_passthrough:  255.00, mgmt_fee:  413.53, adjustments_total:    0.00, net_to_owner: 1883.87, status: "sent" },

  // --- o9 Karen Stevenson ---
  { id: "stmt_o9_2026-01",  owner_id: "o9",  period: "2026-01", gross_revenue:  1005.00, channel_fees:  29.15,  cleaning_passthrough:  125.00, mgmt_fee:  170.17, adjustments_total:    0.00, net_to_owner:  680.68, status: "paid" },
  { id: "stmt_o9_2026-02",  owner_id: "o9",  period: "2026-02", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o9_2026-03",  owner_id: "o9",  period: "2026-03", gross_revenue:  1005.00, channel_fees:  30.15,  cleaning_passthrough:  125.00, mgmt_fee:  169.97, adjustments_total:    0.00, net_to_owner:  679.88, status: "sent" },

  // --- o10 Thomas Belfort ---
  { id: "stmt_o10_2026-01", owner_id: "o10", period: "2026-01", gross_revenue:  1330.00, channel_fees:  39.90,  cleaning_passthrough:  150.00, mgmt_fee:  228.02, adjustments_total:  -90.00, net_to_owner:  822.08, status: "paid" },
  { id: "stmt_o10_2026-02", owner_id: "o10", period: "2026-02", gross_revenue:  1330.00, channel_fees:  39.90,  cleaning_passthrough:  150.00, mgmt_fee:  228.02, adjustments_total:    0.00, net_to_owner:  912.08, status: "paid" },
  { id: "stmt_o10_2026-03", owner_id: "o10", period: "2026-03", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "sent" },

  // --- o11 Angela Morales ---
  { id: "stmt_o11_2026-01", owner_id: "o11", period: "2026-01", gross_revenue:  1970.00, channel_fees:  59.10,  cleaning_passthrough:  170.00, mgmt_fee:  348.18, adjustments_total:    0.00, net_to_owner: 1392.72, status: "paid" },
  { id: "stmt_o11_2026-02", owner_id: "o11", period: "2026-02", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o11_2026-03", owner_id: "o11", period: "2026-03", gross_revenue:  4300.00, channel_fees: 507.10,  cleaning_passthrough:  340.00, mgmt_fee:  690.58, adjustments_total:    0.00, net_to_owner: 2762.32, status: "sent" },

  // --- o12 Greg Sutton ---
  { id: "stmt_o12_2026-01", owner_id: "o12", period: "2026-01", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o12_2026-02", owner_id: "o12", period: "2026-02", gross_revenue:  2270.00, channel_fees:  66.97,  cleaning_passthrough:  270.00, mgmt_fee:  425.27, adjustments_total:    0.00, net_to_owner: 1507.76, status: "paid" },
  { id: "stmt_o12_2026-03", owner_id: "o12", period: "2026-03", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "sent" },

  // --- o13 Michelle Park ---
  { id: "stmt_o13_2026-01", owner_id: "o13", period: "2026-01", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o13_2026-02", owner_id: "o13", period: "2026-02", gross_revenue:   915.00, channel_fees:  27.45,  cleaning_passthrough:  115.00, mgmt_fee:  154.51, adjustments_total:    0.00, net_to_owner:  618.04, status: "paid" },
  { id: "stmt_o13_2026-03", owner_id: "o13", period: "2026-03", gross_revenue:   915.00, channel_fees:  26.54,  cleaning_passthrough:  115.00, mgmt_fee:  154.69, adjustments_total:    0.00, net_to_owner:  618.77, status: "sent" },

  // --- o14 Frank Delacroix ---
  { id: "stmt_o14_2026-01", owner_id: "o14", period: "2026-01", gross_revenue:  2265.00, channel_fees:  67.95,  cleaning_passthrough:  190.00, mgmt_fee:  361.27, adjustments_total:    0.00, net_to_owner: 1645.78, status: "paid" },
  { id: "stmt_o14_2026-02", owner_id: "o14", period: "2026-02", gross_revenue:  2265.00, channel_fees:  67.95,  cleaning_passthrough:  190.00, mgmt_fee:  361.27, adjustments_total:    0.00, net_to_owner: 1645.78, status: "paid" },
  { id: "stmt_o14_2026-03", owner_id: "o14", period: "2026-03", gross_revenue:  3095.00, channel_fees: 464.25,  cleaning_passthrough:  190.00, mgmt_fee:  439.34, adjustments_total:    0.00, net_to_owner: 2001.41, status: "sent" },

  // --- o15 Joyce Andersen ---
  { id: "stmt_o15_2026-01", owner_id: "o15", period: "2026-01", gross_revenue:   780.00, channel_fees:  22.62,  cleaning_passthrough:  100.00, mgmt_fee:  131.48, adjustments_total:    0.00, net_to_owner:  525.90, status: "paid" },
  { id: "stmt_o15_2026-02", owner_id: "o15", period: "2026-02", gross_revenue:     0.00, channel_fees:   0.00,  cleaning_passthrough:    0.00, mgmt_fee:    0.00, adjustments_total:    0.00, net_to_owner:    0.00, status: "paid" },
  { id: "stmt_o15_2026-03", owner_id: "o15", period: "2026-03", gross_revenue:   610.00, channel_fees:  18.30,  cleaning_passthrough:  100.00, mgmt_fee:   98.34, adjustments_total:    0.00, net_to_owner:  393.36, status: "sent" },

  // --- o16 Carl Washington ---
  { id: "stmt_o16_2026-01", owner_id: "o16", period: "2026-01", gross_revenue:  2100.00, channel_fees:  63.00,  cleaning_passthrough:  175.00, mgmt_fee:  372.40, adjustments_total:    0.00, net_to_owner: 1489.60, status: "paid" },
  { id: "stmt_o16_2026-02", owner_id: "o16", period: "2026-02", gross_revenue:  2100.00, channel_fees:  63.00,  cleaning_passthrough:  175.00, mgmt_fee:  372.40, adjustments_total:    0.00, net_to_owner: 1489.60, status: "paid" },
  { id: "stmt_o16_2026-03", owner_id: "o16", period: "2026-03", gross_revenue:  2485.00, channel_fees: 198.80,  cleaning_passthrough:  175.00, mgmt_fee:  422.24, adjustments_total:    0.00, net_to_owner: 1688.96, status: "sent" },
];

// =============================================================================
// PAYOUTS (48) — one per statement
// Jan statements → paid Feb 10 2026 (ACH initiated Feb 3, ~5 business days prior)
// Feb statements → paid Mar 10 2026 (ACH initiated Mar 3)
// Mar statements → processing, ACH scheduled Apr 10 2026 (standard PMS cycle)
// Zero-amount statements still get a payout record; ACH fields null when no
// transfer was initiated. method always "ach".
// =============================================================================

const PAYOUTS = [
  // --- Jan 2026 payouts (paid) ---
  { id: "po_o1_2026-01",  statement_id: "stmt_o1_2026-01",  owner_id: "o1",  amount: 7300.80, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8401" },
  { id: "po_o2_2026-01",  statement_id: "stmt_o2_2026-01",  owner_id: "o2",  amount: 2441.59, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8402" },
  { id: "po_o3_2026-01",  statement_id: "stmt_o3_2026-01",  owner_id: "o3",  amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o4_2026-01",  statement_id: "stmt_o4_2026-01",  owner_id: "o4",  amount: 1586.76, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8403" },
  { id: "po_o5_2026-01",  statement_id: "stmt_o5_2026-01",  owner_id: "o5",  amount:  710.80, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8404" },
  { id: "po_o6_2026-01",  statement_id: "stmt_o6_2026-01",  owner_id: "o6",  amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o7_2026-01",  statement_id: "stmt_o7_2026-01",  owner_id: "o7",  amount:  850.12, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8405" },
  { id: "po_o8_2026-01",  statement_id: "stmt_o8_2026-01",  owner_id: "o8",  amount: 1348.12, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8406" },
  { id: "po_o9_2026-01",  statement_id: "stmt_o9_2026-01",  owner_id: "o9",  amount:  680.68, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8407" },
  { id: "po_o10_2026-01", statement_id: "stmt_o10_2026-01", owner_id: "o10", amount:  822.08, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8408" },
  { id: "po_o11_2026-01", statement_id: "stmt_o11_2026-01", owner_id: "o11", amount: 1392.72, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8409" },
  { id: "po_o12_2026-01", statement_id: "stmt_o12_2026-01", owner_id: "o12", amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o13_2026-01", statement_id: "stmt_o13_2026-01", owner_id: "o13", amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o14_2026-01", statement_id: "stmt_o14_2026-01", owner_id: "o14", amount: 1645.78, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8410" },
  { id: "po_o15_2026-01", statement_id: "stmt_o15_2026-01", owner_id: "o15", amount:  525.90, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8411" },
  { id: "po_o16_2026-01", statement_id: "stmt_o16_2026-01", owner_id: "o16", amount: 1489.60, scheduled_date: "2026-02-03", sent_date: "2026-02-10", status: "paid",       method: "ach", ach_ref: "ACH-20260203-8412" },

  // --- Feb 2026 payouts (paid) ---
  { id: "po_o1_2026-02",  statement_id: "stmt_o1_2026-02",  owner_id: "o1",  amount: 8851.16, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8501" },
  { id: "po_o2_2026-02",  statement_id: "stmt_o2_2026-02",  owner_id: "o2",  amount: 2441.59, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8502" },
  { id: "po_o3_2026-02",  statement_id: "stmt_o3_2026-02",  owner_id: "o3",  amount: 4441.08, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8503" },
  { id: "po_o4_2026-02",  statement_id: "stmt_o4_2026-02",  owner_id: "o4",  amount: 3125.24, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8504" },
  { id: "po_o5_2026-02",  statement_id: "stmt_o5_2026-02",  owner_id: "o5",  amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o6_2026-02",  statement_id: "stmt_o6_2026-02",  owner_id: "o6",  amount: 1276.56, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8505" },
  { id: "po_o7_2026-02",  statement_id: "stmt_o7_2026-02",  owner_id: "o7",  amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o8_2026-02",  statement_id: "stmt_o8_2026-02",  owner_id: "o8",  amount: 1168.12, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8506" },
  { id: "po_o9_2026-02",  statement_id: "stmt_o9_2026-02",  owner_id: "o9",  amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o10_2026-02", statement_id: "stmt_o10_2026-02", owner_id: "o10", amount:  912.08, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8507" },
  { id: "po_o11_2026-02", statement_id: "stmt_o11_2026-02", owner_id: "o11", amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o12_2026-02", statement_id: "stmt_o12_2026-02", owner_id: "o12", amount: 1507.76, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8508" },
  { id: "po_o13_2026-02", statement_id: "stmt_o13_2026-02", owner_id: "o13", amount:  618.04, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8509" },
  { id: "po_o14_2026-02", statement_id: "stmt_o14_2026-02", owner_id: "o14", amount: 1645.78, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8510" },
  { id: "po_o15_2026-02", statement_id: "stmt_o15_2026-02", owner_id: "o15", amount:    0.00, scheduled_date: null,          sent_date: null,          status: "paid",       method: "ach", ach_ref: null },
  { id: "po_o16_2026-02", statement_id: "stmt_o16_2026-02", owner_id: "o16", amount: 1489.60, scheduled_date: "2026-03-03", sent_date: "2026-03-10", status: "paid",       method: "ach", ach_ref: "ACH-20260303-8511" },

  // --- Mar 2026 payouts (processing — ACH scheduled for Apr 10) ---
  { id: "po_o1_2026-03",  statement_id: "stmt_o1_2026-03",  owner_id: "o1",  amount: 7098.34, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o2_2026-03",  statement_id: "stmt_o2_2026-03",  owner_id: "o2",  amount: 3422.96, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o3_2026-03",  statement_id: "stmt_o3_2026-03",  owner_id: "o3",  amount: 3795.44, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o4_2026-03",  statement_id: "stmt_o4_2026-03",  owner_id: "o4",  amount: 2599.27, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o5_2026-03",  statement_id: "stmt_o5_2026-03",  owner_id: "o5",  amount:  710.80, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o6_2026-03",  statement_id: "stmt_o6_2026-03",  owner_id: "o6",  amount: 1551.20, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o7_2026-03",  statement_id: "stmt_o7_2026-03",  owner_id: "o7",  amount: 1002.72, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o8_2026-03",  statement_id: "stmt_o8_2026-03",  owner_id: "o8",  amount: 1883.87, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o9_2026-03",  statement_id: "stmt_o9_2026-03",  owner_id: "o9",  amount:  679.88, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o10_2026-03", statement_id: "stmt_o10_2026-03", owner_id: "o10", amount:    0.00, scheduled_date: null,          sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o11_2026-03", statement_id: "stmt_o11_2026-03", owner_id: "o11", amount: 2762.32, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o12_2026-03", statement_id: "stmt_o12_2026-03", owner_id: "o12", amount:    0.00, scheduled_date: null,          sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o13_2026-03", statement_id: "stmt_o13_2026-03", owner_id: "o13", amount:  618.77, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o14_2026-03", statement_id: "stmt_o14_2026-03", owner_id: "o14", amount: 2001.41, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o15_2026-03", statement_id: "stmt_o15_2026-03", owner_id: "o15", amount:  393.36, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
  { id: "po_o16_2026-03", statement_id: "stmt_o16_2026-03", owner_id: "o16", amount: 1688.96, scheduled_date: "2026-04-10", sent_date: null,          status: "processing", method: "ach", ach_ref: null },
];

// =============================================================================
// DOCUMENTS (10)
// Mix of owner-scoped (agreements, tax) and property-scoped (insurance,
// inspection) documents. Mock URLs — real portal would route to signed
// S3 URLs or DocuSign links.
// =============================================================================

const DOCUMENTS = [
  { id: "doc1",  scope: "owner",    owner_id: "o1",  property_id: null,  filename: "sarah-whitaker-management-agreement-2025.pdf", type: "agreement",  uploaded_at: "2025-11-14", url: "/docs/placeholder.pdf" },
  { id: "doc2",  scope: "owner",    owner_id: "o1",  property_id: null,  filename: "sarah-whitaker-w9-2026.pdf",                   type: "tax",        uploaded_at: "2026-01-08", url: "/docs/placeholder.pdf" },
  { id: "doc3",  scope: "property", owner_id: null,  property_id: "p1",  filename: "sandcastle-412-insurance-cert-2026.pdf",       type: "insurance",  uploaded_at: "2026-01-02", url: "/docs/placeholder.pdf" },
  { id: "doc4",  scope: "property", owner_id: null,  property_id: "p2",  filename: "mustang-towers-7b-hvac-inspection-q1.pdf",     type: "inspection", uploaded_at: "2026-03-14", url: "/docs/placeholder.pdf" },
  { id: "doc5",  scope: "owner",    owner_id: "o3",  property_id: null,  filename: "diane-kowalski-management-agreement-2024.pdf", type: "agreement",  uploaded_at: "2024-09-22", url: "/docs/placeholder.pdf" },
  { id: "doc6",  scope: "property", owner_id: null,  property_id: "p7",  filename: "driftwood-house-pool-safety-inspection.pdf",   type: "inspection", uploaded_at: "2026-02-19", url: "/docs/placeholder.pdf" },
  { id: "doc7",  scope: "property", owner_id: null,  property_id: "p10", filename: "tide-pool-house-roof-claim-2026-04.pdf",       type: "other",      uploaded_at: "2026-04-16", url: "/docs/placeholder.pdf" },
  { id: "doc8",  scope: "owner",    owner_id: "o4",  property_id: null,  filename: "robert-tran-w9-2026.pdf",                      type: "tax",        uploaded_at: "2026-01-22", url: "/docs/placeholder.pdf" },
  { id: "doc9",  scope: "property", owner_id: null,  property_id: "p15", filename: "bayside-retreat-insurance-cert-2026.pdf",      type: "insurance",  uploaded_at: "2026-02-04", url: "/docs/placeholder.pdf" },
  { id: "doc10", scope: "owner",    owner_id: "o6",  property_id: null,  filename: "james-harrington-management-agreement-2025.pdf", type: "agreement", uploaded_at: "2025-07-30", url: "/docs/placeholder.pdf" },
];

// =============================================================================
// EXPORT BLOCK
// Single DATA object exposes all collections to portal.html via <script> tag.
// CommonJS guard lets Node-based validation scripts require() the same file.
// =============================================================================

const DATA = {
  channels: CHANNELS,
  vendors: VENDORS,
  owners: OWNERS,
  guests: GUESTS,
  channel_listings: CHANNEL_LISTINGS,
  properties: PROPERTIES,
  reservations: RESERVATIONS,
  maintenance_tickets: MAINTENANCE_TICKETS,
  rate_periods: RATE_PERIODS,
  cleaning_tasks: CLEANING_TASKS,
  adjustments: ADJUSTMENTS,
  statements: STATEMENTS,
  payouts: PAYOUTS,
  documents: DOCUMENTS,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DATA, DEMO_TODAY, daysBetween, computeFinancials };
}
