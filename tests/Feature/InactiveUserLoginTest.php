<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InactiveUserLoginTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $email, bool $active): User
    {
        $user = User::forceCreate([
            'name' => 'Pegawai',
            'email' => $email,
            'password' => bcrypt('password'),
            'role' => 'peserta',
            'email_verified_at' => now(),
            'is_active' => $active,
        ]);

        return $user->fresh();
    }

    public function test_active_user_can_login(): void
    {
        $this->makeUser('aktif@test.com', true);

        $response = $this->post(route('login.store'), [
            'email' => 'aktif@test.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->makeUser('nonaktif@test.com', false);

        $response = $this->post(route('login.store'), [
            'email' => 'nonaktif@test.com',
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_inactive_user_cannot_login_with_remember(): void
    {
        $this->makeUser('ingat@test.com', false);

        $this->post(route('login.store'), [
            'email' => 'ingat@test.com',
            'password' => 'password',
            'remember' => true,
        ]);

        $this->assertGuest();
    }
}
