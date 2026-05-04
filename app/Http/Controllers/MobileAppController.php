<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class MobileAppController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('mobile-app');
    }
}
