const app = Vue.createApp({
  data() {
    return {
      hotelId: null,
      templateId: 1,
      title: "Site Name",
      email: "Site email",
      phoneNumber: "Site phone number",
      address: "Site address",
      realImages: [],

      mapIframeHtml: `<div style="max-width:100%;overflow:hidden;color:red;height:400px;"><div id="display-google-map" style="height:100%; width:100%;max-width:100%;"><iframe style="height:100%;width:100%;border:0;" frameborder="0" src="https://www.google.com/maps/embed/v1/place?q=hillroost&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"></iframe></div><a class="from-embedmap-code" href="https://www.bootstrapskins.com/themes" id="auth-map-data">premium bootstrap themes</a><style>#display-google-map img.text-marker{max-width:none!important;background:none!important;}img{max-width:none}</style></div>`,

      aboutUsImages: [
        { src: "img/about-1.jpg", alt: "About Us Image 1" },
        { src: "img/about-2.jpg", alt: "About Us Image 2" },
        { src: "img/about-3.jpg", alt: "About Us Image 3" },
        { src: "img/about-4.jpg", alt: "About Us Image 4" },
      ],

      carouselImages: [
        {
          src: "img/carousel-1.jpg",
          alt: "Carousel Image 1",
          carouselTitle: "Luxury Living",
          carouselDescription: "A luxury tourist residence...",
        },
        {
          src: "img/carousel-2.jpg",
          alt: "Carousel Image 2",
          carouselTitle: "Luxury Living",
          carouselDescription: "A luxury tourist residence...",
        },
      ],

      description:
        "Hill Roost is located in Kandy, the most beautiful city in central Sri Lanka. We are at Ampitiya-Kandy road, about 3km away from the Kandy City Center. We are very close to the major tourist attractions of the city like the Temple of the Tooth, Kandy Lake, restaurants, and shopping areas.Kandy is the last kingdom of ancient Sri Lanka, and it is full of cultural, traditional,<br><br> and historical values to explore. Geographically, Kandy is a plateau located in the central highlands of Sri Lanka, surrounded by magnificent mountains. This provides beautiful landscapes, mountain views, and a pleasant climate, attracting millions of tourists every year.Hill Roost is more like a home for your stay in Kandy, offering luxury accommodation with<br><br> a unique boutique hotel concept. Hill Roost has 5 bedrooms with large common areas including lobbies, sitting areas, ",
      attraction: "WITHIN KANDY CITY",

      subContainerTitle: "Click to Edit  Title",
      subContainerDescription: "Click to Edit  Description",
      subContainerImage: "img/hotel3.jpg",
      footerDescription: "Edit Footer Description",

      attractionList: [],
      roomsDetails: [],

      isEditingCarouselImages: false,
      isEditingAboutUsImages: false,
      isEditingTitle: false,
      isEditingEmail: false,
      isEditingPhoneNumber: false,
      isEditingDescription: false,

      isEditingCarouselTitle: false,
      isEditingCarouselDescription: false,
      isEditingSubContainerTitle: false,
      isEditingSubContainerDescription: false,
      isEditingFooterDescription: false,

      editCarouselText: [
        {
          isEditingCarouselTitle: false,
          isEditingCarouselDescription: false,
        },
        {
          isEditingCarouselTitle: false,
          isEditingCarouselDescription: false,
        },
      ],

      editCarouselImages: [
        { src: "", alt: "", carouselTitle: "", carouselDescription: "" },
        { src: "", alt: "", carouselTitle: "", carouselDescription: "" },
      ],

      editSubContainerTitle: "",
      editSubContainerDescription: "",
      editFooterDescription: "",

      editAboutUsImages: [
        { src: "", alt: "" },
        { src: "", alt: "" },
        { src: "", alt: "" },
        { src: "", alt: "" },
      ],

      offers: [],

      aboutImgStyle: [
        {
          width: "w-75",
          style: "margin-top: 25%;",
          end: "text-end",
        },
        {
          width: "w-100",
          end: "text-start",
        },
        {
          width: "w-50",
          end: "text-end",
        },
        {
          width: "w-75",
          end: "text-start",
        },
      ],

      editTitle: "",
      editEmail: "",
      editPhoneNumber: "",
      editDescription: "",

      isLoading: null,
      isError: null,
      isSuccess: null,
    };
  },

  methods: {
    formatDate(dateString) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
    },
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/site-details?templateId=${this.templateId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const err = await response.json();
          console.error(err);
          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const siteDetails = await response.json();
          console.log("Site details loaded successfully:", siteDetails);
          // this.title = siteDetails.details.title;
          // this.email = siteDetails.details.email;
          // this.phoneNumber = siteDetails.details.phoneNumber;
          this.aboutUsImages = siteDetails.details.aboutUsImages;
          this.carouselImages = siteDetails?.details?.carouselImages;
          this.description = siteDetails?.details?.description;
          this.realImages = siteDetails?.details?.realImages;
          // this.address = siteDetails?.details?.address;
          this.mapIframeHtml = siteDetails?.details?.mapIframeHtml;
          this.attraction = siteDetails?.details?.attraction;
          this.attractionList =
            siteDetails?.details?.attractionList || this.attractionList;
          this.subContainerTitle =
            siteDetails?.details?.subContainerTitle || this.subContainerTitle;
          this.subContainerDescription =
            siteDetails?.details?.subContainerDescription ||
            this.subContainerDescription;
          this.subContainerImage =
            siteDetails?.details?.subContainerImage || this.subContainerImage;
          this.footerDescription =
            siteDetails?.details?.footerDescription || this.footerDescription;

          this.isLoading = null;
          this.isSuccess = "Site details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        // this.isLoading = null;
        // this.isError = "Error fetching site details";
        // setTimeout(() => {
        //   this.isError = null;
        // }, 5000);
        console.log("Error fetching site details:", error);
      }
    },

    async saveDetails() {
      this.isLoading = "Saving...";
      const details = {
        hotelId: this.hotelId,
        templateId: this.templateId,
        title: this.title,
        email: this.email,
        phoneNumber: this.phoneNumber,
        aboutUsImages: this.aboutUsImages,
        carouselImages: this.carouselImages,
        description: this.description,
        realImages: this.realImages,
        address: this.address,
        mapIframeHtml: this.mapIframeHtml,
        attraction: this.attraction,
        attractionList: this.attractionList,
        subContainerTitle: this.subContainerTitle,
        subContainerDescription: this.subContainerDescription,
        subContainerImage: this.subContainerImage,
        footerDescription: this.footerDescription,
      };

      try {
        const response = await fetch(
          "https://webtemplateapi.ceyinfo.com/temp1/save-site-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(details),
          }
        );

        if (!response.ok) {
          const err = await response.json();

          console.error("Error saving details:", err.message);
          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Details saved successfully:", result);
          this.isLoading = null;
          this.isSuccess = "Details saved successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error saving details:", error);
        this.isLoading = null;
        this.isError = "Error saving details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },

    async publishChanges() {
      this.isLoading = "Publishing...";

      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/build-template?templateId=${this.templateId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const err = await response.json();

          console.log(err);
          console.error("Error publishing changes:");
          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Changes published successfully:", result);

          this.isLoading = null;
          this.isSuccess = "Changes published successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error publishing changes:", error);
        this.isLoading = null;
        this.isError = error?.message;
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },

    async hotelInfo() {
      try {
        const response = await fetch(`https://webtemplateapi.ceyinfo.com/temp1/hotel-info`, {
          credentials: "include",
        });
        console.log(response);
        if (!response.ok) {
          const err = await response.json();

          console.error("Error fetching hotel info:", err);
          console.log(err);
          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result);

          if (result) {
            console.log("result", result.data.name);
            this.title = result.data.name;
            this.email = result.data.email;
            this.phoneNumber = result.data.mobile;
            this.address = result.data.address1;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },

    async loadRoomDetails() {
      this.isLoading = "Loading room data...";

      try {
        const response = await fetch(`https://webtemplateapi.ceyinfo.com/temp1/rooms-info`, {
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.json();
          console.error("Error loading room details:", errorText);
          this.isLoading = null;
          this.isError = errorText.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);

          // alert(
          //   "This hotel does not have any rooms yet. Please add rooms and room prices to continue. You will be redirected to the admin panel."
          // );
          // return (window.location.href = "https://admin.ceyinfo.cloud");
        } else {
          const roomDetails = await response.json();
          console.log("Room details loaded successfully:", roomDetails);

          //slice 3 rooms

          this.roomsDetails = roomDetails.data.slice(0, 3);

          // this.roomsDetails = roomDetails;
          this.isLoading = null;
          this.isSuccess = "Room details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
        this.isLoading = null;
        this.isError = "Error fetching room details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async hotelOffers() {
      try {
        const response = await fetch(
          `https://webtemplateapi.ceyinfo.com/temp1/hotel-offers`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const err = await response.json();

          console.error("Error fetching hotel info:", errorText);

          this.isLoading = null;
          this.isError = err.message;
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result?.data);

          console.log("result", result?.data);

          if (result) {
            this.offers = result.data;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },

    editClickFooterDescription() {
      this.isEditingFooterDescription = true;
      this.editFooterDescription = this.footerDescription;
    },

    updateFooterDescription() {
      this.footerDescription = this.editFooterDescription;
      this.isEditingFooterDescription = false;
    },

    editClickSubContainerTitle() {
      this.isEditingSubContainerTitle = true;
      this.editSubContainerTitle = this.subContainerTitle;
    },
    editClickSubContainerDescription() {
      this.isEditingSubContainerDescription = true;
      this.editSubContainerDescription = this.subContainerDescription;
    },

    updateSubContainerTitle() {
      this.subContainerTitle = this.editSubContainerTitle;
      this.isEditingSubContainerTitle = false;
    },
    updateSubContainerDescription() {
      this.subContainerDescription = this.editSubContainerDescription;

      this.isEditingSubContainerDescription = false;
    },

    triggerUploadSubContainerImage() {
      const fileInput = this.$refs["fileInputSubContainer"];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error("File input ref not found.");
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        console.log("Selected file:", file);
        // this.subContainerImage = URL.createObjectURL(file);

        //convert image to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          this.subContainerImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    editClickCarouselImage(index) {
      this.isEditingCarouselImages = true;

      this.editCarouselImages[index].src = this.carouselImages[index].src;
      this.editCarouselImages[index].alt = this.carouselImages[index].alt;
    },

    triggerCarouselImageFileInput(index) {
      const fileInput = this.$refs[`fileInput${index}`];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input ref for index ${index} not found.`);
      }
    },

    saveCarouselChanges() {
      this.isEditingCarouselImages = false;
    },

    handleFileUploadCarouselImage(event, index) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.carouselImages[index].src = e.target.result;
          console.log("Image uploaded successfully:", e.target.result);
        };

        reader.readAsDataURL(file);
      } else {
        console.log("No file selected.");
      }
    },

    editClickTitle() {
      this.isEditingTitle = true;
      this.editTitle = this.title;
    },
    updateTitle() {
      this.title = this.editTitle;
      this.isEditingTitle = false;
    },

    editClickEmail() {
      this.isEditingEmail = true;
      this.editEmail = this.email;
    },

    editAboutUsImage() {
      this.isEditingAboutUsImages = true;
      console.log("clicked");
    },

    updateEmail() {
      this.email = this.editEmail;
      this.isEditingEmail = false;
    },

    editClickPhoneNumber() {
      this.isEditingPhoneNumber = true;
      this.editPhoneNumber = this.phoneNumber;
    },

    updatePhoneNumber() {
      this.phoneNumber = this.editPhoneNumber;
      this.isEditingPhoneNumber = false;
    },

    triggerFileInput(index) {
      const fileInput = this.$refs["fileInput" + index];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input for index ${index} not found.`);
      }
    },
    getAmenityIcon(amenity) {
      if (!amenity) return null;

      switch (amenity.toLowerCase()) {
        case "wifi":
          return "fa-wifi";
        case "tv":
          return "fa-tv";
        case "ac":
          return "fa-snowflake";
        case "balcony":
          return "fa-building";
        default:
          return null;
      }
    },
    handleFileUpload(event, index) {
      console.log("index:", index);
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.aboutUsImages[index].src = e.target.result;
          console.log("Image uploaded successfully:", e.target.result);
        };

        reader.readAsDataURL(file);
      } else {
        console.log("No file selected.");
      }
    },

    saveEditedImages() {
      console.log("Changes saved successfully:", this.aboutUsImages);
      this.saveDetails();

      this.isEditingAboutUsImages = false;
    },

    cancelEditing() {
      this.isEditingAboutUsImages = false;
    },

    editClickCarouselTitle(index) {
      this.editCarouselText[index].isEditingCarouselTitle = true;

      this.editCarouselImages[index].carouselTitle =
        this.carouselImages[index].carouselTitle;
    },

    updateCarouselTitle(index) {
      this.carouselImages[index].carouselTitle =
        this.editCarouselImages[index].carouselTitle;

      this.editCarouselText[index].isEditingCarouselTitle = false;
    },

    editClickCarouselDescription(index) {
      this.editCarouselText[index].isEditingCarouselDescription = true;

      this.editCarouselImages[index].carouselDescription =
        this.carouselImages[index].carouselDescription;
    },

    updateCarouselDescription(index) {
      this.carouselImages[index].carouselDescription =
        this.editCarouselImages[index].carouselDescription;

      this.editCarouselText[index].isEditingCarouselDescription = false;
    },

    cancelCarouselEditing() {
      this.isEditingCarouselImages = false;
    },

    editDescriptionClick() {
      this.isEditingDescription = true;
      this.editDescription = this.description.replace(/<br\s*\/?>/gi, "\n");

      console.log("clicked");
    },

    updateDescription() {
      this.description = this.editDescription.replace(/\n/g, "<br>");
      this.isEditingDescription = false;

      console.log(this.editDescription);
    },

    cancelEditingDescription() {
      this.isEditingDescription = false;
    },

    mapSrc() {
      return this.mapIframeHtml;
    },
  },
  mounted() {
    this.loadRoomDetails();
    this.loadSiteDetails();
    this.hotelInfo();
    this.hotelOffers();
  },
});
app.mount("#app");
