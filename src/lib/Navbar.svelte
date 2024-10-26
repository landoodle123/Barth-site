<script>
    // You can add any props or state here if needed
</script>

<style>
    .navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 20px;
        background-size: cover;
        background-position: center;
        height: 60px;
        color: black;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        border-bottom: 2px solid white;
    }

    .navbar-text {
        font-size: 48px;
        font-weight: bold;
        font-style: italic;
    }

    .navbar-links {
        display: flex;
        gap: 15px;
    }

    .navbar-links a {
        text-decoration: none;
        color: black;
        font-size: 24px;
    }

    main {
        padding-top: 60px;
    }

    .navbar-icons {
        width: 20px;
        height: 20px;
    }
</style>

<div
        class="navbar"
        style="background-image: url('/barthnavbar.png');"
>
    <div class="navbar-text">GREAT REALM OF BARTHOLOMUE</div>
</div>
