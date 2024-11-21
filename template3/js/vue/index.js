const app = Vue.createApp({
  data() {
    return {
      hotelId: null,
      templateId: 3,
      title: "Click to edit site name",
      address: "No 12, Colombo Road, Colombo 03",
      phoneNumber: "0765280144",
      email: "isurusajith68@gmail.com",
      headerTitle: "Click to edit header title",
      galleryHeaderTitle: "Click to edit header title",
      homeHeaderImage: "img/gallery_1.jpeg",
      galleryHeaderImage: "img/gallery_2.jpeg",
      heroImage: "img/hero_1.jpeg",
      heroDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      menuHearderDescription:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis ab debitis sit",

      menuTitle1: "Crab with Curry Sources",
      menuDescription1:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      menuImage1: "img/gallery_1.jpeg",

      menuTitle2: "Tuna Roast Beef",
      menuDescription2:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      menuImage2: "img/gallery_2.jpeg",

      menuTitle3: "Egg with Mushroom",
      menuDescription3:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      menuImage3: "img/gallery_3.jpeg",

      reservationDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      footerDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      galleryDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      reservationHeaderTitle: "Click to edit header title",
      reservationHeaderImage: "img/gallery_1.jpeg",

      bookATableDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      bookTableImage: "img/hero_1.jpeg",

      contactUsTitle: "Don't be shy, let's chat.",
      contactUsDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      galleryFirstFiveImages: [
        "img/gallery_1.jpeg",
        "img/gallery_2.jpeg",
        "img/gallery_3.jpeg",
        "img/gallery_4.jpeg",
        "img/gallery_5.jpeg",
      ],
      gallerySecondFiveImages: [
        "img/gallery_5.jpeg",
        "img/gallery_6.jpeg",
        "img/gallery_7.jpeg",
        "img/gallery_8.jpeg",
        "img/gallery_9.jpeg",
      ],
      galleryThirdFiveImages: [
        "img/gallery_1.jpeg",
        "img/gallery_2.jpeg",
        "img/gallery_3.jpeg",
        "img/gallery_4.jpeg",
        "img/gallery_5.jpeg",
      ],
      galleryFourthFiveImages: [
        "img/gallery_5.jpeg",
        "img/gallery_6.jpeg",
        "img/gallery_7.jpeg",
        "img/gallery_8.jpeg",
        "img/gallery_9.jpeg",
      ],
      contactUsHeaderTitle: "Contact Us",
      contactUsHeaderImage: "img/hero_1.jpeg",
      aboutHeaderImage: "img/hero_1.jpeg",
      aboutHeaderTitle: "About Us",

      editTitle: "",
      editHeaderTitle: "",
      editGalleryHeaderTitle: "",
      editHeroDescription: "",
      editMenuTitle1: "",
      editMenuDescription1: "",
      editMenuTitle2: "",
      editMenuDescription2: "",
      editMenuTitle3: "",
      editMenuDescription3: "",
      editMenuHearderDescription: "",
      editReservationDescription: "",
      editFooterDescription: "",
      editGalleryDescription: "",
      editReservationHeaderTitle: "",
      editBookATableDescription: "",
      editContactUsHeaderTitle: "",
      editContactUsTitle: "",
      editContactUsDescription: "",
      editAboutHeaderTitle: "",

      isEditingTitle: false,
      isEditingHeaderTitle: false,
      isEditingGalleryHeaderTitle: false,
      isEditingHeroDescription: false,
      isEditingMenuTitle1: false,
      isEditingMenuDescription1: false,
      isEditingMenuTitle2: false,
      isEditingMenuDescription2: false,
      isEditingMenuTitle3: false,
      isEditingMenuDescription3: false,
      isEditingMenuHearderDescription: false,
      isEditingReservationDescription: false,
      isEditingFooterDescription: false,
      isEditingGalleryDescription: false,
      isEditingReservationHeaderTitle: false,
      isEditingBookATableDescription: false,
      isEditingContactUsHeaderTitle: false,
      isEditingContactUsTitle: false,
      isEditingContactUsDescription: false,
      isEditingAboutHeaderTitle: false,

      isLoading: null,
      isError: null,
      isSuccess: null,
    };
  },
  methods: {
    editClickTitle() {
      this.isEditingTitle = true;

      this.editTitle = this.title;
    },
    updateTitle() {
      if (this.editTitle == "") {
        this.isError = "Please enter a valid title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      if (this.editTitle.length < 5) {
        this.isError = "Title must be at least 5 characters";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.title = this.editTitle;

      this.isEditingTitle = false;
    },
    editClickGalleryHeaderTitle() {
      this.isEditingGalleryHeaderTitle = true;
      this.editGalleryHeaderTitle = this.galleryHeaderTitle;
    },
    updateGalleryHeaderTitle() {
      if (this.editGalleryHeaderTitle == "") {
        this.isError = "Please enter a valid header title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.galleryHeaderTitle = this.editGalleryHeaderTitle;
      this.isEditingGalleryHeaderTitle = false;
    },
    editClickHeaderTitle() {
      this.isEditingHeaderTitle = true;
      this.editHeaderTitle = this.headerTitle;
    },
    updateHeaderTitle() {
      if (this.editHeaderTitle == "") {
        this.isError = "Please enter a valid header title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.headerTitle = this.editHeaderTitle;
      this.isEditingHeaderTitle = false;
    },
    editClickHeroDescription() {
      this.isEditingHeroDescription = true;
      this.editHeroDescription = this.heroDescription;
    },
    updateHeroDescription() {
      if (this.editHeroDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.heroDescription = this.editHeroDescription;
      this.isEditingHeroDescription = false;
    },
    editClickMenuTitle1() {
      this.isEditingMenuTitle1 = true;
      this.editMenuTitle1 = this.menuTitle1;
    },
    updateMenuTitle1() {
      if (this.editMenuTitle1 == "") {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.menuTitle1 = this.editMenuTitle1;
      this.isEditingMenuTitle1 = false;
    },
    editClickMenuDescription1() {
      this.isEditingMenuDescription1 = true;
      this.editMenuDescription1 = this.menuDescription1;
    },
    updateMenuDescription1() {
      if (this.editMenuDescription1 < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuDescription1 = this.editMenuDescription1;
      this.isEditingMenuDescription1 = false;
    },
    editClickMenuTitle2() {
      this.isEditingMenuTitle2 = true;
      this.editMenuTitle2 = this.menuTitle2;
    },
    updateMenuTitle2() {
      if (this.editMenuTitle2 == "") {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuTitle2 = this.editMenuTitle2;
      this.isEditingMenuTitle2 = false;
    },
    editClickMenuDescription2() {
      this.isEditingMenuDescription2 = true;
      this.editMenuDescription2 = this.menuDescription2;
    },
    updateMenuDescription2() {
      if (this.editMenuDescription2 < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.menuDescription2 = this.editMenuDescription2;
      this.isEditingMenuDescription2 = false;
    },
    editClickMenuTitle3() {
      this.isEditingMenuTitle3 = true;
      this.editMenuTitle3 = this.menuTitle3;
    },
    updateMenuTitle3() {
      if (this.editMenuTitle3 == "") {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.menuTitle3 = this.editMenuTitle3;
      this.isEditingMenuTitle3 = false;
    },
    editClickMenuDescription3() {
      this.isEditingMenuDescription3 = true;
      this.editMenuDescription3 = this.menuDescription3;
    },
    updateMenuDescription3() {
      if (this.editMenuDescription3 < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuDescription3 = this.editMenuDescription3;
      this.isEditingMenuDescription3 = false;
    },
    editClickMenuHearderDescription() {
      this.isEditingMenuHearderDescription = true;
      this.editMenuHearderDescription = this.menuHearderDescription;
    },
    updateMenuHearderDescription() {
      if (this.editMenuHearderDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuHearderDescription = this.editMenuHearderDescription;
      this.isEditingMenuHearderDescription = false;
    },
    editClickReservationDescription() {
      this.isEditingReservationDescription = true;
      this.editReservationDescription = this.reservationDescription;
    },
    updateReservationDescription() {
      if (this.editReservationDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.reservationDescription = this.editReservationDescription;
      this.isEditingReservationDescription = false;
    },
    editClickReservationHeaderTitle() {
      this.isEditingReservationHeaderTitle = true;
      this.editReservationHeaderTitle = this.reservationHeaderTitle;
    },
    updateReservationHeaderTitle() {
      if (this.editReservationHeaderTitle == "") {
        this.isError = "Please enter a valid header title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.reservationHeaderTitle = this.editReservationHeaderTitle;

      this.isEditingReservationHeaderTitle = false;
    },
    editClickFooterDescription() {
      this.isEditingFooterDescription = true;
      this.editFooterDescription = this.footerDescription;
    },
    updateFooterDescription() {
      if (this.editFooterDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);
        return;
      }
      this.footerDescription = this.editFooterDescription;
      this.isEditingFooterDescription = false;
    },
    editClickGalleryDescription() {
      this.isEditingGalleryDescription = true;

      this.editGalleryDescription = this.galleryDescription;
    },
    updateGalleryDescription() {
      if (this.editGalleryDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);
        return;
      }
      this.galleryDescription = this.editGalleryDescription;
      this.isEditingGalleryDescription = false;
    },
    ediClickBookATableDescription() {
      this.isEditingBookATableDescription = true;

      this.editBookATableDescription = this.bookATableDescription;
    },
    updateBookATableDescription() {
      if (this.editBookATableDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);
        return;
      }
      this.bookATableDescription = this.editBookATableDescription;

      this.isEditingBookATableDescription = false;
    },
    editClickContactUsHeaderTitle() {
      this.isEditingContactUsHeaderTitle = true;

      this.editContactUsHeaderTitle = this.contactUsHeaderTitle;
    },
    updateContactUsHeaderTitle() {
      if (this.editContactUsHeaderTitle < 5) {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);
        return;
      }
      this.contactUsHeaderTitle = this.editContactUsHeaderTitle;

      this.isEditingContactUsHeaderTitle = false;
    },
    editClickContactUsTitle() {
      this.isEditingContactUsTitle = true;

      this.editContactUsTitle = this.contactUsTitle;
    },

    updateContactUsTitle() {
      if (this.editContactUsTitle < 5) {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.contactUsTitle = this.editContactUsTitle;

      this.isEditingContactUsTitle = false;
    },

    editClickAboutHeaderTitle() {
      this.isEditingAboutHeaderTitle = true;

      this.editAboutHeaderTitle = this.aboutHeaderTitle;
    },

    updateAboutAboutHeaderTitle() {
      if (this.editAboutHeaderTitle < 5) {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.aboutHeaderTitle = this.editAboutHeaderTitle;

      this.isEditingAboutHeaderTitle = false;
    },

    editClickContactUsDescription() {
      this.isEditingContactUsDescription = true;

      this.editContactUsDescription = this.contactUsDescription;
    },

    updateContactUsDescription() {
      if (this.editContactUsDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(
          () => {
            this.isError = null;
          },

          3000
        );

        return;
      }

      this.contactUsDescription = this.editContactUsDescription;

      this.isEditingContactUsDescription = false;
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    triggerHeroImageUpload() {
      this.$refs.heroImage.click();
    },
    triggerMenuImage1Upload() {
      this.$refs.menuImage1.click();
    },

    triggerMenuImage2Upload() {
      this.$refs.menuImage2.click();
    },

    triggerMenuImage3Upload() {
      this.$refs.menuImage3.click();
    },

    triggerGalleryHeaderImageUpload() {
      this.$refs.galleryHeaderImage.click();
    },
    triggerReservationHeaderImageUpload() {
      this.$refs.reservationHeaderImage.click();
    },
    triggerReservationBookTableImageImageUpload() {
      this.$refs.reservationBookTableImageImage.click();
    },
    triggerContactHeaderImageUpload() {
      this.$refs.ContactHeaderImage.click();
    },
    triggerFileInputAboutHeaderImage() {
      this.$refs.fileInputAboutHeaderImage.click();
    },

    async uploadSingleImage(event, imageType) {
      this.isLoading = "Uploading...";

      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("imageType", imageType);
        formData.append("hotelId", this.hotelId);
        formData.append("templateId", this.templateId);

        try {
          const response = await fetch(
            `https://be-publish.ceyinfo.cloud/temp3/upload-single?hotelId=${this.hotelId}&templateId=${this.templateId}`,
            {
              method: "POST",
              body: formData,
            }
          );

          const result = await response.json();

          const data = result.details;
          console.log("Data:", data);
          if (data[imageType]) {
            this[imageType] = data[imageType];
          }
          console.log("Image uploaded successfully:", data);

          this.isLoading = null;
          this.isSuccess = "Images uploaded successfully";

          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } catch (error) {
          console.error("Error uploading image:", error);
          this.isLoading = null;
          this.isError = "Error uploading images";

          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      }
    },
    handleFileChangeFirstFive(event) {
      const files = event.target.files;
      const maxFiles = 5;

      if (files.length > maxFiles) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);
        return;
      }

      const formData = new FormData();

      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        formData.append("images", files[i]);
      }

      this.uploadImages(formData, "galleryFirstFiveImages");
    },

    handleFileChangeSecondFive(event) {
      const files = event.target.files;
      const maxFiles = 5;

      if (files.length > maxFiles) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);

        return;
      }

      const formData = new FormData();

      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        formData.append("images", files[i]);
      }

      this.uploadImages(formData, "gallerySecondFiveImages");
    },
    handleFileChangeThirdFive(event) {
      const files = event.target.files;
      const maxFiles = 5;

      if (files.length > maxFiles) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);

        return;
      }

      const formData = new FormData();

      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        formData.append("images", files[i]);
      }

      this.uploadImages(formData, "galleryThirdFiveImages");
    },
    handleFileChangeFourthFive(event) {
      const files = event.target.files;
      const maxFiles = 5;

      if (files.length > maxFiles) {
        this.isError = `You can upload a maximum of ${maxFiles} images.`;

        setTimeout(() => {
          this.isError = null;
        }, 5000);

        return;
      }

      const formData = new FormData();

      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        formData.append("images", files[i]);
      }

      this.uploadImages(formData, "galleryFourthFiveImages");
    },
    async uploadImages(formData, imageType) {
      this.isLoading = "Uploading...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/temp3/upload-images?hotelId=${this.hotelId}&templateId=${this.templateId}&imageType=${imageType}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();

          const result = data.data.details;
          // console.log("Result:", data);
          if (result[imageType]) {
            this[imageType] = result[imageType];
          }

          this.isLoading = null;
          this.isSuccess = "Images uploaded successfully";

          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          const errorText = await response.text();
          console.error("Error uploading images:", errorText);

          this.isLoading = null;
          this.isError = "Error uploading images";

          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        this.isLoading = null;
        this.isError = "Error uploading images";

        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/site-details?hotelId=${this.hotelId}&templateId=${this.templateId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error loading site details:", errorText);
          this.isLoading = null;
          this.isError = "Error loading site details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const siteDetails = await response.json();
          console.log("Site details loaded successfully:", siteDetails);
          this.title = siteDetails.details.title;
          this.address = siteDetails.details.address;
          this.phoneNumber = siteDetails.details.phoneNumber;
          this.email = siteDetails.details.email;
          this.headerTitle = siteDetails.details.headerTitle;
          this.homeHeaderImage = siteDetails.details.homeHeaderImage;
          this.heroImage = siteDetails.details.heroImage;
          this.heroDescription = siteDetails.details.heroDescription;
          this.menuHearderDescription =
            siteDetails.details.menuHearderDescription;
          this.menuTitle1 = siteDetails.details.menuTitle1;
          this.menuDescription1 = siteDetails.details.menuDescription1;
          this.menuImage1 = siteDetails.details.menuImage1;
          this.menuTitle2 = siteDetails.details.menuTitle2;
          this.menuDescription2 = siteDetails.details.menuDescription2;
          this.menuImage2 = siteDetails.details.menuImage2;
          this.menuTitle3 = siteDetails.details.menuTitle3;
          this.menuDescription3 = siteDetails.details.menuDescription3;
          this.menuImage3 = siteDetails.details.menuImage3;
          this.reservationDescription =
            siteDetails.details.reservationDescription;
          this.footerDescription = siteDetails.details.footerDescription;
          this.galleryHeaderTitle = siteDetails.details.galleryHeaderTitle;
          this.galleryHeaderImage = siteDetails.details.galleryHeaderImage;
          this.galleryFirstFiveImages =
            siteDetails.details.galleryFirstFiveImages ||
            this.galleryFirstFiveImages;
          this.gallerySecondFiveImages =
            siteDetails.details.gallerySecondFiveImages ||
            this.gallerySecondFiveImages;
          this.galleryThirdFiveImages =
            siteDetails.details.galleryThirdFiveImages ||
            this.galleryThirdFiveImages;
          this.galleryFourthFiveImages =
            siteDetails.details.galleryFourthFiveImages ||
            this.galleryFourthFiveImages;
          this.galleryDescription = siteDetails.details.galleryDescription;
          this.reservationHeaderTitle =
            siteDetails.details.reservationHeaderTitle ||
            this.reservationHeaderTitle;
          this.reservationHeaderImage =
            siteDetails.details.reservationHeaderImage;

          this.bookTableImage = siteDetails.details.bookTableImage;
          this.bookATableDescription =
            siteDetails.details.bookATableDescription ||
            this.bookATableDescription;
          this.contactUsHeaderTitle =
            siteDetails.details.contactUsHeaderTitle ||
            this.contactUsHeaderTitle;
          this.contactUsHeaderImage = siteDetails.details.contactUsHeaderImage;
          this.contactUsTitle =
            siteDetails.details.contactUsTitle || this.contactUsTitle;
          this.contactUsDescription =
            siteDetails.details.contactUsDescription ||
            this.contactUsDescription;
          this.aboutHeaderImage = siteDetails.details.aboutHeaderImage;
          this.aboutHeaderTitle =
            siteDetails.details.aboutHeaderTitle || this.aboutHeaderTitle;

          this.isLoading = null;
          this.isSuccess = "Site details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching site details:", error);
        this.isLoading = null;
        this.isError = "Error fetching site details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    async saveChanges() {
      const data = {
        hotelId: this.hotelId,
        templateId: this.templateId,
        title: this.title,
        address: this.address,
        phoneNumber: this.phoneNumber,
        email: this.email,
        headerTitle: this.headerTitle,
        homeHeaderImage: this.homeHeaderImage,
        heroImage: this.heroImage,
        heroDescription: this.heroDescription,
        menuHearderDescription: this.menuHearderDescription,
        menuTitle1: this.menuTitle1,
        menuDescription1: this.menuDescription1,
        menuImage1: this.menuImage1,
        menuTitle2: this.menuTitle2,
        menuDescription2: this.menuDescription2,
        menuImage2: this.menuImage2,
        menuTitle3: this.menuTitle3,
        menuDescription3: this.menuDescription3,
        menuImage3: this.menuImage3,
        reservationDescription: this.reservationDescription,
        footerDescription: this.footerDescription,
        galleryFirstFiveImages: this.galleryFirstFiveImages,
        gallerySecondFiveImages: this.gallerySecondFiveImages,
        galleryThirdFiveImages: this.galleryThirdFiveImages,
        galleryFourthFiveImages: this.galleryFourthFiveImages,
        galleryHeaderImage: this.galleryHeaderImage,
        galleryHeaderTitle: this.galleryHeaderTitle,
        galleryDescription: this.galleryDescription,
        reservationHeaderTitle: this.reservationHeaderTitle,
        reservationHeaderImage: this.reservationHeaderImage,
        bookTableImage: this.bookTableImage,
        bookATableDescription: this.bookATableDescription,
        contactUsHeaderTitle: this.contactUsHeaderTitle,
        contactUsHeaderImage: this.contactUsHeaderImage,
        contactUsTitle: this.contactUsTitle,
        contactUsDescription: this.contactUsDescription,
        aboutHeaderTitle: this.aboutHeaderTitle,
        aboutHeaderImage: this.aboutHeaderImage,
      };
      this.isLoading = "Saving changes...";
      console.log("Data to save:", data);
      try {
        const response = await fetch(
          "https://be-publish.ceyinfo.cloud/temp3/save-site-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          this.isLoading = null;
          this.isSuccess = "Changes saved successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          this.isLoading = null;
          this.isError = "Failed to save changes";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Failed to save changes", error);
        this.isLoading = null;
        this.isError = "Failed to save changes";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },

    async hotelInfo() {
      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/hotel-info?hotelId=${this.hotelId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching hotel info:", errorText);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result);

          if (result) {
            // this.title = result.name;
            this.email = result.email;
            this.phoneNumber = result.mobile;
            this.address = result.address1;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },
    async publishChanges() {
      this.isLoading = "Publishing...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/temp3/build-template?hotelId=${this.hotelId}&templateId=${this.templateId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error publishing changes:", errorText);
          this.isLoading = null;
          this.isError = "Error publishing changes";
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
        this.isError = "Error publishing changes";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.hotelId = urlParams.get("hotelId");

    if (
      !this.hotelId ||
      this.hotelId == "" ||
      this.hotelId == "null" ||
      this.hotelId == "undefined"
    ) {
      alert("Hotel ID not found in URL parameters.");
      window.location.href = "https://admin.ceyinfo.cloud";
    } else {
      this.loadSiteDetails();
      this.hotelInfo();
    }
  },
});

app.mount("#app");
