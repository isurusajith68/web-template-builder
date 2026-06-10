const app = Vue.createApp({
  data() {
    return {
      hotelId: null,
      orgId: null,
      templateId: 1,
      bookingUrl: null,
      title: "Site Name",
      email: "Site email",
      phoneNumber: "Site phone number",
      address: "Site address",
      logo: "",

      carouselImages: [{ src: "img/carousel-1.jpg" }],

      footerDescription: "Footer Description",
      facebookLink: "",
      bookingcomLink: "",
      tripadvisorLink: "",
      youtubeLink: "",
      privacyPolicy: "",
      termsCondition: "",

      menuCategories: [],
      menuItems: [],
      priceTypes: [],
      menuTypes: [],

      selectedCategory: null,
      selectedPriceType: null,
      selectedMenuType: null,
      viewMode: 'grid',

      isLoading: null,
      isError: null,
      isSuccess: null,
    };
  },
  computed: {
    filteredItems() {
      if (this.selectedCategory === null) return this.menuItems;
      return this.menuItems.filter(
        (item) =>
          item.menu_category_id === this.selectedCategory ||
          item.menu_subcategory_id === this.selectedCategory,
      );
    },

    getFilteredPrices() {
      const selectedPriceType = this.selectedPriceType;
      const selectedMenuType = this.selectedMenuType;

      return (item) => {
        let prices = Array.isArray(item.prices)
          ? item.prices
          : typeof item.prices === "string"
          ? JSON.parse(item.prices)
          : [];

        if (selectedPriceType !== null) {
          const specific = prices.filter(
            (p) => Number(p.price_type_id) === selectedPriceType,
          );
          prices = specific.length > 0
            ? specific
            : prices.filter((p) => p.price_type_id === null);
        }

        if (selectedMenuType !== null) {
          const specific = prices.filter(
            (p) => Number(p.menu_type_id) === selectedMenuType,
          );
          prices = specific.length > 0
            ? specific
            : prices.filter((p) => p.menu_type_id === null);
        }

        const tierMap = {};
        prices.forEach((p) => {
          const key = Number(p.tier_id);
          if (!tierMap[key] || Number(p.price) < Number(tierMap[key].price)) {
            tierMap[key] = p;
          }
        });

        return Object.values(tierMap).sort((a, b) => Number(a.tier_id) - Number(b.tier_id));
      };
    },
  },
  methods: {

    async hotelInfo() {
      try {
        const response = await fetch(`${window.API_BASE}/temp1/hotel-info`, {
          credentials: "include",
        });
        if (!response.ok) {
          const err = await response.json();
          this.isError = err.message;
          setTimeout(() => { this.isError = null; }, 5000);
        } else {
          const result = await response.json();
          if (result) {
            this.title = result.data.name;
            this.email = result.data.email;
            this.phoneNumber = result.data.mobile;
            this.address = result.data.address1;
            this.hotelId = result.data.id;
            this.orgId = result.data.orgId;
            this.logo = result.data.logo;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },

    async loadSiteDetails() {
      this.isLoading = "Loading site data...";
      try {
        const response = await fetch(
          `${window.API_BASE}/temp1/site-details?templateId=${this.templateId}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          const errorText = await response.json();
          this.isLoading = null;
          this.isError = errorText.message;
          setTimeout(() => { this.isError = null; }, 5000);
        } else {
          const siteDetails = await response.json();
          this.carouselImages = siteDetails?.details?.carouselImages;
          this.footerDescription = siteDetails?.details?.footerDescription || this.footerDescription;
          this.facebookLink = siteDetails?.details?.facebookLink || "";
          this.bookingcomLink = siteDetails?.details?.bookingcomLink || "";
          this.tripadvisorLink = siteDetails?.details?.tripadvisorLink || "";
          this.youtubeLink = siteDetails?.details?.youtubeLink || "";
          this.privacyPolicy = siteDetails?.details?.privacyPolicy || "";
          this.termsCondition = siteDetails?.details?.termsCondition || "";
          this.isLoading = null;
        }
      } catch (error) {
        console.error("Error fetching site details:", error);
      }
    },

    async templateDetails() {
      try {
        const response = await fetch(
          `${window.API_BASE}/temp1/template-details?templateId=${this.templateId}`,
          { credentials: "include" },
        );
        if (response.ok) {
          const data = await response.json();
          this.bookingUrl =
            data?.booking_platform === 1 ? window.BOOKING_URL : window.BOOKING_URL_2;
        }
      } catch (error) {
        console.error("Error fetching template details:", error);
      }
    },

    async loadMenuInfo() {
      this.isLoading = "Loading menu...";
      try {
        const response = await fetch(`${window.API_BASE}/temp1/menu-info`, {
          credentials: "include",
        });
        if (!response.ok) {
          const err = await response.json();
          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => { this.isError = null; }, 5000);
        } else {
          const result = await response.json();
          this.menuCategories = result.data.categories;
          this.priceTypes = result.data.priceTypes;
          this.menuTypes = result.data.menuTypes;
          this.menuItems = result.data.items;
          if (result.data.priceTypes.length > 0) {
            this.selectedPriceType = result.data.priceTypes[0].price_type_id;
          }
          if (result.data.menuTypes.length > 0) {
            this.selectedMenuType = result.data.menuTypes[0].menu_type_id;
          }
          this.isLoading = null;
          this.isSuccess = "Menu loaded successfully";
          setTimeout(() => { this.isSuccess = null; }, 5000);
        }
      } catch (error) {
        console.error("Error fetching menu info:", error);
        this.isLoading = null;
      }
    },

    openPrivacyModal() {
      $("#privacyPolicyModal").modal("show");
    },
    openTermsModal() {
      $("#termsModal").modal("show");
    },
  },
  mounted() {
    this.loadSiteDetails();
    this.hotelInfo();
    this.templateDetails();
    this.loadMenuInfo();
  },
});

app.mount("#menu");
